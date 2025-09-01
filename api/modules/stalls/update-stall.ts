import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";
import * as admin from "firebase-admin";

async function updateStallHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await authenticateToken(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { stallId } = req.params;
    const { eventId, zoneId, trackId, name, description } = req.body;
    
    if (!eventId || !zoneId || !trackId || !name || !stallId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, trackId, stallId, and name are required" 
      });
    }

    const stallData = {
      name,
      description: description || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: authResult.uid,
    };

    await db
      .collection("events")
      .doc(eventId)
      .collection("zones")
      .doc(zoneId)
      .collection("tracks")
      .doc(trackId)
      .collection("stalls")
      .doc(stallId)
      .update(stallData);

    res.status(200).json({
      success: true,
      data: {
        id: stallId,
        message: "Stall updated successfully"
      }
    });
  } catch (e: any) {
    console.error("Error updating stall:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to update stall" 
    });
  }
}

export default updateStallHandler;