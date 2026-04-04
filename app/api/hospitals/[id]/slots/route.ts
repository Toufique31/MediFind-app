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

    // 1. Query 'availabilitySlots' collection
    const slotsSnapshot = await db
      .collection('availabilitySlots')
      .where('hospitalId', '==', id)
      .where('serviceName', '==', service)
      .where('date', '==', date)
      .where('isBooked', '==', false)
      .get();

    // 2. Return array of time strings
    const times = slotsSnapshot.docs.map(doc => doc.data().time as string);

    return NextResponse.json(times, { status: 200 });

  } catch (error: any) {
    console.error('Get Slots Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
