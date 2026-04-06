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

    // 2. Find the matching service document
    const servicesSnapshot = await db.collection('hospitals').doc(hospitalId).collection('services').where('name', '==', serviceName).limit(1).get();
    
    if (servicesSnapshot.empty) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const slotsSnapshot = await servicesSnapshot.docs[0].ref
      .collection('slots')
      .where('date', '==', date)
      .where('time', '==', time)
      .get();

    const availableSlot = slotsSnapshot.docs.find(doc => doc.data().isBooked === false);

    if (!availableSlot) {
      return NextResponse.json({ error: 'Slot not available' }, { status: 409 });
    }

    // We can use a batch to update both atomically
    const batch = db.batch();

    // The slot document reference
    const slotRef = availableSlot.ref;

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
