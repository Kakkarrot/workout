import 'server-only';
import {cert, getApps, initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

function getFirebaseApp() {
    const existingApp = getApps()[0];
    if (existingApp) return existingApp;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Firebase service account credentials are not configured');
    }

    return initializeApp({
        credential: cert({projectId, clientEmail, privateKey}),
    });
}

export function getFirestoreDatabase() {
    const databaseId = process.env.FIREBASE_DATABASE_ID;
    if (!databaseId) throw new Error('FIREBASE_DATABASE_ID is not configured');

    return getFirestore(getFirebaseApp(), databaseId);
}
