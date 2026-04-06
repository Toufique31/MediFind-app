import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const p = await params;
    const { id } = p;
    
    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service');
    const date = searchParams.get('date');

    if (!id || !service || !date) {
      return NextResponse.json(
        { error: 'Missing id, service, or date parameters' },
        { status: 400 }
      );
    }

    // 1. Find the service
    const servicesSnapshot = await db.collection('hospitals').doc(id).collection('services').where('name', '==', service).limit(1).get();
    if (servicesSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    // 2. Query its slots by date
    const slotsSnapshot = await servicesSnapshot.docs[0].ref
      .collection('slots')
      .where('date', '==', date)
      .get();

    // 3. Return array of time strings for unbooked slots
    const times = slotsSnapshot.docs
      .filter(doc => doc.data().isBooked === false)
      .map(doc => doc.data().time as string);

    return NextResponse.json(times, { status: 200 });

  } catch (error: any) {
    console.error('Get Slots Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
