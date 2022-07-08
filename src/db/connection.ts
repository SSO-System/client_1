import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

var serviceAccount = require("./firebase_private_key/oauth2-c28ca-firebase-adminsdk-alegi-341ce7fce0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = getFirestore();

