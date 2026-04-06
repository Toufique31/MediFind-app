import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js 16, params in route handlers requires awaiting properly or is synchronous depending on config, but the safe way if it's dynamic is to use it directly, wait, let's treat it as an async segment or destructure. In Next.js 15+ we usually await params if it's treated as a promise.
) {
  try {
    const p = await params;
    const { id } = p;

    if (!id) {
      return NextResponse.json({ error: 'Missing hospital id' }, { status: 400 });
    }

    // 1. Fetch hospital document
    const hospitalDoc = await db.collection('hospitals').doc(id).get();
    if (!hospitalDoc.exists) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }
    const hospitalData = hospitalDoc.data()!;

    // 2. Fetch all documents from services where hospitalId == id
    const servicesSnapshot = await db
      .collection('hospitals')
      .doc(id)
      .collection('services')
      .get();
    
    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 3. Fetch up to 10 documents from 'reviews' subcollection
    const reviewsSnapshot = await db
      .collection('hospitals')
      .doc(id)
      .collection('reviews')
      .limit(10)
      .get();
      
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // 4. Return combined JSON
    return NextResponse.json({
      id,
      ...hospitalData,
      services,
      reviews
    }, { status: 200 });

  } catch (error: any) {
    console.error('Get Hospital Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
