import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";
import * as admin from "firebase-admin";

async function createTrackHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await authenticateToken(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { eventId, zoneId, title, description } = req.body;
    
    if (!eventId || !zoneId || !title) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, and title are required" 
      });
    }

    const trackData = {
      title,
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.uid,
    };

    const trackRef = await db.collection("events")
      .doc(eventId)
      .collection("zones")
      .doc(zoneId)
      .collection("tracks")
      .add(trackData);

    res.status(201).json({
      success: true,
      data: {
        id: trackRef.id,
        message: "Track created successfully"
      }
    });
  } catch (e: any) {
    console.error("Error creating track:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to create track" 
    });
  }
}

export default createTrackHandler;