import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";
async function getSessionsHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await authenticateToken(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { eventId, zoneId, trackId } = req.query;
    
    if (!eventId || !zoneId || !trackId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, and trackId are required" 
      });
    }

    const sessionsSnapshot = await db.collection("events")
      .doc(eventId as string)
      .collection("zones")
      .doc(zoneId as string)
      .collection("tracks")
      .doc(trackId as string)
      .collection("sessions")
      .orderBy("startTime")
      .get();

    const sessions: any[] = [];
    sessionsSnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        ...data,
        startTime: data.startTime?.toDate?.() || data.startTime,
        endTime: data.endTime?.toDate?.() || data.endTime
      });
    });

    res.status(200).json({
      success: true,
      data: {
        sessions: sessions
      }
    });
  } catch (e: any) {
    console.error("Error fetching sessions:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch sessions" 
    });
  }
}

export default getSessionsHandler;