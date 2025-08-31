import { Request, Response } from "express";
import { db } from "../config/firebase";
import admin from "firebase-admin";

export default async function meHandler(req: Request, res: Response) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    let uid;

    try {
      
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      uid = payload.uid;
      
      if (!uid) {
        throw new Error("No UID found in token");
      }
    
      await admin.auth().getUser(uid);
      
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ uid: uid, ...userDoc.data() });
  } catch (e: any) {
   
    res.status(500).json({ error: e.message || "Failed to fetch user" });
  }
}