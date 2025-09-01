
import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function createSessionHandler(req: Request, res: Response) {
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

    const { eventId, zoneId, trackId, title, description, speaker, startTime, endTime } = req.body;
    
    if (!eventId || !zoneId || !trackId || !title || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, trackId, title, startTime, and endTime are required" 
      });
    }


    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        error: "End time must be after start time"
      });
    }

    const sessionData = {
      title,
      description: description || '',
      speaker: speaker || '',
      startTime: start,
      endTime: end,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sessionRef = await db.collection("events")
      .doc(eventId)
      .collection("zones")
      .doc(zoneId)
      .collection("tracks")
      .doc(trackId)
      .collection("sessions")
      .add(sessionData);

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: {
        sessionId: sessionRef.id,
        ...sessionData
      }
    });
  } catch (e: any) {
    console.error("Error creating session:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to create session" 
    });
  }
}

export default createSessionHandler;