import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";
import * as admin from "firebase-admin";

async function createStallHandler(req: Request, res: Response) {
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

    const { eventId, zoneId, trackId, name, description } = req.body;
    
    if (!eventId || !zoneId || !trackId || !name) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, trackId, and name are required" 
      });
    }

    const stallData = {
      name,
      description: description || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.uid,
    };

    const stallRef = await db
      .collection("events")
      .doc(eventId)
      .collection("zones")
      .doc(zoneId)
      .collection("tracks")
      .doc(trackId)
      .collection("stalls")
      .add(stallData);

    res.status(201).json({
      success: true,
      data: {
        id: stallRef.id,
        message: "Stall created successfully"
      }
    });
  } catch (e: any) {
    console.error("Error creating stall:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to create stall" 
    });
  }
}

export default createStallHandler;