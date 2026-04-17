/**
 * scripts/seed.ts — MediFind Firestore Seed
 *
 * Seeds the database with 6 Kolkata hospitals, 6 diagnostic services each,
 * and 8 availability time-slots per service per day for the next 7 days.
 *
 * ── Prerequisites ────────────────────────────────────────────────────────
 *  1. Download a Firebase service-account key JSON from:
 *       Firebase Console → Project Settings → Service Accounts
 *       → "Generate new private key"
 *
 *  2. Set the GOOGLE_APPLICATION_CREDENTIALS env variable to the path of
 *     that JSON file before running the script:
 *
 *       # PowerShell
 *       $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
 *
 *       # Bash / macOS
 *       export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *
 *  3. Run:  pnpm seed
 * ─────────────────────────────────────────────────────────────────────────
 */

import * as admin from 'firebase-admin';

// ── Firebase Admin initialisation ────────────────────────────────────────────
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error("Missing Firebase Project ID in environment variables");
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

// ── Type helpers ─────────────────────────────────────────────────────────────
interface Hospital {
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  rating: number;
  reviewCount: number;
}

interface Service {
  name: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
}

// ── Hospital data ────────────────────────────────────────────────────────────
const HOSPITALS: Hospital[] = [
  {
    name: 'Apollo Gleneagles Hospital',
    address: '58 Canal Circular Rd, Kadapara',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5744,
    lon: 88.3848,
    rating: 4.8,
    reviewCount: 412,
  },
  {
    name: 'AMRI Hospital Dhakuria',
    address: '230 NSC Bose Rd, Dhakuria',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5087,
    lon: 88.3598,
    rating: 4.7,
    reviewCount: 289,
  },
  {
    name: 'Medica Superspecialty Hospital',
    address: '127 Mukundapur',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.4982,
    lon: 88.3954,
    rating: 4.6,
    reviewCount: 334,
  },
  {
    name: 'Peerless Hospital',
    address: '360 Panchasayar',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.4873,
    lon: 88.3942,
    rating: 4.5,
    reviewCount: 201,
  },
  {
    name: 'RN Tagore International Institute',
    address: '124 EM Bypass, Mukundapur',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.4951,
    lon: 88.3961,
    rating: 4.9,
    reviewCount: 567,
  },
  {
    name: 'Woodlands Multispeciality',
    address: '8/5 Alipore Rd',
    city: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5388,
    lon: 88.3352,
    rating: 4.4,
    reviewCount: 178,
  },
];

// ── Service data ─────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  { name: 'MRI Scan', minPrice: 3500, maxPrice: 5500, currency: 'INR' },
  { name: 'CT Scan', minPrice: 2500, maxPrice: 4000, currency: 'INR' },
  { name: 'X-Ray', minPrice: 400, maxPrice: 800, currency: 'INR' },
  { name: 'Blood Test', minPrice: 300, maxPrice: 600, currency: 'INR' },
  { name: 'Ultrasound', minPrice: 800, maxPrice: 1500, currency: 'INR' },
  { name: 'ECG', minPrice: 200, maxPrice: 500, currency: 'INR' },
];

// ── Slot times (24-h format) ─────────────────────────────────────────────────
const SLOT_TIMES: [number, number][] = [
  [9, 0],   // 9:00 AM
  [9, 30],  // 9:30 AM
  [10, 0],  // 10:00 AM
  [10, 30], // 10:30 AM
  [11, 0],  // 11:00 AM
  [14, 0],  // 2:00 PM
  [15, 0],  // 3:00 PM
  [16, 0],  // 4:00 PM
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the next `n` dates starting from today (local midnight). */
function getNextDays(n: number): Date[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

/** Formats a Date as "YYYY-MM-DD". */
function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Formats 24-h [hour, minute] → "H:MM AM/PM". */
function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}

/** Random price between min and max, rounded to the nearest ₹50. */
function randomPrice(min: number, max: number): number {
  const raw = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(raw / 50) * 50;
}

// ── Main seed function ───────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('🌱  Starting Firestore seed…\n');

  const days = getNextDays(7);
  let hospitalCount = 0;
  let serviceCount = 0;
  let slotCount = 0;

  for (const hospital of HOSPITALS) {
    console.log(`🏥  ${hospital.name}`);

    // ── hospitals/{id} ───────────────────────────────────────────────────
    const hospitalRef = db.collection('hospitals').doc();
    await hospitalRef.set({
      name: hospital.name,
      address: hospital.address,
      city: hospital.city,
      state: hospital.state,
      location: new admin.firestore.GeoPoint(hospital.lat, hospital.lon),
      rating: hospital.rating,
      reviewCount: hospital.reviewCount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    hospitalCount++;

    // ── hospitals/{id}/services/{id} ─────────────────────────────────────
    for (const service of SERVICES) {
      const price = randomPrice(service.minPrice, service.maxPrice);

      const serviceRef = hospitalRef.collection('services').doc();
      await serviceRef.set({
        name: service.name,
        price,
        currency: service.currency,
        minPrice: service.minPrice,
        maxPrice: service.maxPrice,
        hospitalId: hospitalRef.id,
        hospitalName: hospital.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      serviceCount++;

      // ── …/services/{id}/slots/{id} ────────────────────────────────────
      // Firestore batches are limited to 500 writes.
      // 7 days × 8 slots = 56 writes per batch — well within the limit.
      const batch = db.batch();
      let batchSize = 0;

      for (const day of days) {
        const dateStr = formatDate(day);

        for (const [hour, minute] of SLOT_TIMES) {
          const slotDT = new Date(day);
          slotDT.setHours(hour, minute, 0, 0);

          const slotRef = serviceRef.collection('slots').doc();
          batch.set(slotRef, {
            date: dateStr,
            time: formatTime(hour, minute),
            dateTime: admin.firestore.Timestamp.fromDate(slotDT),
            isBooked: false,
            hospitalId: hospitalRef.id,
            serviceId: serviceRef.id,
            serviceName: service.name,
          });
          batchSize++;
          slotCount++;
        }
      }

      await batch.commit();
      console.log(`   ✓ ${service.name} — ₹${price} — ${batchSize} slots`);
    }

    console.log('');
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log('─'.repeat(50));
  console.log('✅  Seed complete!');
  console.log(`   Hospitals : ${hospitalCount}`);
  console.log(`   Services  : ${serviceCount}  (${serviceCount / hospitalCount} per hospital)`);
  console.log(`   Slots     : ${slotCount}  (${slotCount / serviceCount} per service)`);
  console.log('─'.repeat(50));
}

// ── Run ──────────────────────────────────────────────────────────────────────

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  });
