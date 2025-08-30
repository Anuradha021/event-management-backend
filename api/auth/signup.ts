import { Request, Response } from "express";
import { db } from "../firebase";
import admin from "firebase-admin";

export default async function signupHandler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

   
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

    res.status(201).json({ 
      message: "User created", 
      uid: userRecord.uid,
      token: customToken  
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Signup failed" });
  }
}