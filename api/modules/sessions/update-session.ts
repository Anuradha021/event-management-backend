import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function updateSessionHandler(req: Request, res: Response) {
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

    const { sessionId } = req.params;
    const { eventId, zoneId, trackId, title, description, speaker, startTime, endTime } = req.body;
    
    if (!eventId || !zoneId || !trackId || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, trackId, and sessionId are required" 
      });
    }

    
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (end <= start) {
        return res.status(400).json({
          success: false,
          error: "End time must be after start time"
        });
      }
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (speaker !== undefined) updateData.speaker = speaker;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);

    await db.collection("events")
      .doc(eventId)
      .collection("zones")
      .doc(zoneId)
      .collection("tracks")
      .doc(trackId)
      .collection("sessions")
      .doc(sessionId)
      .update(updateData);

    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: updateData
    });
  } catch (e: any) {
    console.error("Error updating session:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to update session" 
    });
  }
}

export default updateSessionHandler;