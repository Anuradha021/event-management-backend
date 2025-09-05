import admin from "firebase-admin";
import { db } from "../config/firebase";

export class AuthService {
  static getUserProfile(token: string) {
    throw new Error("Method not implemented.");
  }
  static login(email: any, password: any) {
    throw new Error("Method not implemented.");
  }
  static signup(email: any, password: any, name: any, role: any) {
    throw new Error("Method not implemented.");
  }
  async login(email: string, password: string) {
    const user = await admin.auth().getUserByEmail(email);
    const customToken = await admin.auth().createCustomToken(user.uid);
    return { token: customToken, uid: user.uid };
  }

  async signup(email: string, password: string, name: string, role?: string) {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role: role || "employee",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    return { uid: userRecord.uid, token: customToken };
  }

  async getUserProfile(token: string) {
    let uid;

    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    uid = payload.uid;

    if (!uid) throw new Error("No UID found in token");

    await admin.auth().getUser(uid);

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) throw new Error("User not found");

    return { uid, ...userDoc.data() };
  }
}