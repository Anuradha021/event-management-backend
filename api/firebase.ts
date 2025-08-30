import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON as string
  );

 
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
