import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      hospitalId,
      serviceName,
      date,
      time,
      patientName,
      patientEmail,
      patientPhone,
      price,
      userId
    } = body;

    if (!hospitalId || !serviceName || !date || !time || !patientName || !patientEmail || !patientPhone) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    // 2. Find the matching slot in 'availabilitySlots'
    const slotsSnapshot = await db
      .collection('availabilitySlots')
      .where('hospitalId', '==', hospitalId)
      .where('serviceName', '==', serviceName)
      .where('date', '==', date)
      .where('time', '==', time)
      .where('isBooked', '==', false)
      .limit(1)
      .get();

    if (slotsSnapshot.empty) {
      return NextResponse.json({ error: 'Slot not available' }, { status: 409 });
    }

    // We can use a batch to update both atomically
    const batch = db.batch();

    // The slot document reference
    const slotDocId = slotsSnapshot.docs[0].id;
    const slotRef = db.collection('availabilitySlots').doc(slotDocId);

    // Update slot
    batch.update(slotRef, { isBooked: true });

    // 1. Create a new document in 'bookings' collection
    const newBookingRef = db.collection('bookings').doc();
    batch.set(newBookingRef, {
      hospitalId,
      serviceName,
      date,
      time,
      patientName,
      patientEmail,
      patientPhone,
      price: price || 0,
      userId: userId || null,
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Commit the batch
    await batch.commit();

    // 3. Return success
    return NextResponse.json({ success: true, bookingId: newBookingRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('Bookings Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
