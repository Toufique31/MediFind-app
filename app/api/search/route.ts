import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { service, location, filters } = body;

    if (!service || !location) {
      return NextResponse.json({ error: 'Missing service or location' }, { status: 400 });
    }

    // 1. Geocode user location
    if (!process.env.GOOGLE_MAPS_SERVER_KEY) {
      return NextResponse.json({ error: 'Server configuration error: Missing Maps API key' }, { status: 500 });
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const userLat = geocodeData.results[0].geometry.location.lat;
    const userLon = geocodeData.results[0].geometry.location.lng;

    // 2. Filter hospitals at DB level — 1 read instead of fetching all
    const hospitalsSnapshot = await db
      .collection('hospitals')
      .where('serviceNames', 'array-contains', service)
      .get();

    if (hospitalsSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const hospitalIds = hospitalsSnapshot.docs.map((doc) => doc.id);
    const today = new Date().toISOString().split('T')[0];

    // 3. Batch-fetch today's slots across all matching hospitals in one collectionGroup query
    //    Firestore 'in' supports up to 30 values; chunk if needed
    const CHUNK_SIZE = 30;
    const slotsMap: Record<string, { availableToday: boolean; nextSlot?: string }> = {};

    for (let i = 0; i < hospitalIds.length; i += CHUNK_SIZE) {
      const chunk = hospitalIds.slice(i, i + CHUNK_SIZE);
      const slotsSnapshot = await db
        .collectionGroup('slots')
        .where('hospitalId', 'in', chunk)
        .where('date', '==', today)
        .get();

      for (const slotDoc of slotsSnapshot.docs) {
        const slot = slotDoc.data();
        const hid = slot.hospitalId as string;
        if (!slotsMap[hid]) {
          slotsMap[hid] = { availableToday: false };
        }
        if (!slot.isBooked) {
          if (!slotsMap[hid].availableToday) {
            slotsMap[hid].availableToday = true;
            slotsMap[hid].nextSlot = slot.time;
          }
        }
      }
    }

    // 4. Build results from already-fetched hospital docs — no extra reads
    const rawResults: any[] = [];

    for (const hospitalDoc of hospitalsSnapshot.docs) {
      const hospitalId = hospitalDoc.id;
      const hospitalData = hospitalDoc.data();

      const hospLat = hospitalData.location
        ? hospitalData.location._latitude ?? hospitalData.location.latitude
        : hospitalData.lat;
      const hospLon = hospitalData.location
        ? hospitalData.location._longitude ?? hospitalData.location.longitude
        : hospitalData.lon;

      const distance = getDistanceFromLatLonInKm(userLat, userLon, hospLat, hospLon);

      const slotInfo = slotsMap[hospitalId] ?? { availableToday: false };

      if (filters?.availableToday && !slotInfo.availableToday) continue;

      // Resolve price: prefer serviceNames-parallel pricelist field, fallback to servicePrices map
      const price: number =
        hospitalData.servicePrices?.[service] ??
        hospitalData.price ??
        0;

      rawResults.push({
        id: hospitalId,
        ...hospitalData,
        services: hospitalData.serviceNames ?? [],
        lat: hospLat,
        lon: hospLon,
        price,
        distance,
        availableToday: slotInfo.availableToday,
        nextSlot: slotInfo.nextSlot,
      });
    }

    if (rawResults.length === 0) return NextResponse.json([], { status: 200 });

    // 5. Apply filters (priceRange, rating, distance)
    let filteredResults = rawResults.filter((h) => {
      if (filters?.priceRange && (h.price < filters.priceRange[0] || h.price > filters.priceRange[1])) return false;
      if (filters?.rating && (h.rating || 0) < filters.rating) return false;
      if (filters?.distance && h.distance > filters.distance) return false;
      return true;
    });

    if (filteredResults.length === 0) return NextResponse.json([], { status: 200 });

    // 6. Compute weighted score and sort
    const prices = filteredResults.map((h) => h.price);
    const maxPrice = Math.max(...prices, 1);
    const minPrice = Math.min(...prices, 0);
    const priceDiff = maxPrice - minPrice;

    // Normalize distance across all filtered results (0–1 scale)
    const maxDist = Math.max(...filteredResults.map((h) => h.distance), 1);

    filteredResults = filteredResults
      .map((h) => {
        const normalizedPrice = priceDiff === 0 ? 0 : (h.price - minPrice) / priceDiff;
        const normalizedDist = h.distance / maxDist; // 0 (closest) → 1 (farthest)
        // Closer hospitals score higher; contributions stay within expected weight ranges
        h.score =
          (1 - normalizedDist) * 0.4 +  // distance component (closer = higher)
          (h.rating || 0) * 0.4 -        // rating component
          normalizedPrice * 0.2;          // price component (cheaper = higher)
        return h;
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(filteredResults, { status: 200 });
  } catch (error: any) {
    console.error('Search Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
