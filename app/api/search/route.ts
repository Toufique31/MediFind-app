import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
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

    // 1. Get Lat/Lon from Google Maps
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      location
    )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const userLat = geocodeData.results[0].geometry.location.lat;
    const userLon = geocodeData.results[0].geometry.location.lng;

    // 2. Query 'hospitalServices'
    const servicesSnapshot = await db
      .collection('hospitalServices')
      .where('serviceName', '==', service)
      .get();

    if (servicesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    // Combine data
    const rawResults: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const doc of servicesSnapshot.docs) {
      const serviceData = doc.data();
      const hospitalId = serviceData.hospitalId;

      // 3. Fetch hospital document
      const hospitalDoc = await db.collection('hospitals').doc(hospitalId).get();
      if (!hospitalDoc.exists) continue;

      const hospitalData = hospitalDoc.data()!;
      // Assuming hospital has location: GeoPoint or lat/lon fields
      let hospLat = hospitalData.lat;
      let hospLon = hospitalData.lon;
      if (hospitalData.location) {
        hospLat = hospitalData.location.latitude;
        hospLon = hospitalData.location.longitude;
      }

      // 4. Calculate Distance
      const distance = getDistanceFromLatLonInKm(userLat, userLon, hospLat, hospLon);

      // 6. Check availableToday if required
      if (filters?.availableToday) {
        const slotsSnapshot = await db
          .collection('availabilitySlots')
          .where('hospitalId', '==', hospitalId)
          .where('serviceName', '==', service)
          .where('date', '==', today)
          .where('isBooked', '==', false)
          .limit(1)
          .get();

        if (slotsSnapshot.empty) {
          continue; // skip this one
        }
      }

      rawResults.push({
        id: hospitalId,
        ...hospitalData,
        servicePrice: serviceData.price || serviceData.servicePrice || 0,
        distance,
      });
    }

    // 5. Apply filters (priceRange, minimum rating, max distance)
    let filteredResults = rawResults.filter((h) => {
      let isMatch = true;
      if (filters?.priceRange) {
        if (h.servicePrice < filters.priceRange[0] || h.servicePrice > filters.priceRange[1]) isMatch = false;
      }
      if (filters?.rating && (h.rating || 0) < filters.rating) {
        isMatch = false;
      }
      if (filters?.distance && h.distance > filters.distance) {
        isMatch = false;
      }
      return isMatch;
    });

    if (filteredResults.length === 0) return NextResponse.json([], { status: 200 });

    // 7. Compute weighted score
    const maxPrice = Math.max(...filteredResults.map((h) => h.servicePrice), 1);
    const minPrice = Math.min(...filteredResults.map((h) => h.servicePrice), 0);
    const priceDiff = maxPrice - minPrice;

    filteredResults = filteredResults.map((h) => {
      const normalizedPrice = priceDiff === 0 ? 0 : (h.servicePrice - minPrice) / priceDiff;
      const normalizedDistance = h.distance === 0 ? 0.01 : h.distance; // prevent div by zero
      
      const distanceComponent = (1 / normalizedDistance) * 0.4;
      const ratingComponent = (h.rating || 0) * 0.4;
      const priceComponent = normalizedPrice * 0.2;

      h.score = distanceComponent + ratingComponent - priceComponent;
      return h;
    });

    // 8. Sort by score descending
    filteredResults.sort((a, b) => b.score - a.score);

    return NextResponse.json(filteredResults, { status: 200 });
  } catch (error: any) {
    console.error('Search Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
