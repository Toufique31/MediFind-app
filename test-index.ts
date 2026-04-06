import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "medifind-web"
});

const db = admin.firestore();

async function run() {
  try {
    const servicesSnapshot = await db
      .collectionGroup('services')
      .where('name', '==', 'MRI Scan')
      .get();
    console.log('Services size:', servicesSnapshot.size);
    /*
        const slotsSnapshot = await db
          .collectionGroup('slots')
          .where('hospitalId', '==', 'dummy')
          .where('serviceName', '==', 'dummy')
          .where('date', '==', 'dummy')
          .where('isBooked', '==', false)
          .limit(1)
          .get();
        console.log('Slots size:', slotsSnapshot.size);
    */
  } catch (error) {
    console.error('Full Error:', error);
  }
}

run().then(() => process.exit(0)).catch(console.error);
