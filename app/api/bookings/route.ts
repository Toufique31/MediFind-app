import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  try {
    // Verify Firebase ID token from Authorization header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let verifiedUserId: string;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      verifiedUserId = decoded.uid;
    } catch (authError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      hospitalId,
      serviceName,
      date,
      time,
      patientName,
      patientEmail,
      patientPhone,
      price
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

    // We will use a transaction to prevent race conditions during booking
    const newBookingRef = db.collection('bookings').doc();
    
    await db.runTransaction(async (tx) => {
      // 1. Read the slot document within the transaction
      const slotSnap = await tx.get(availableSlot.ref);
      
      // 2. Check if the slot got booked by another request
      if (slotSnap.data()?.isBooked === true) {
        throw new Error('SLOT_TAKEN');
      }

      // 3. If not booked, update slot and create booking
      tx.update(availableSlot.ref, { isBooked: true });
      tx.set(newBookingRef, {
        hospitalId,
        serviceName,
        date,
        time,
        patientName,
        patientEmail,
        patientPhone,
        price: price || 0,
        userId: verifiedUserId,
        status: 'confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    // Return success
    return NextResponse.json({ success: true, bookingId: newBookingRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('Bookings Route Error:', error);
    
    if (error.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
