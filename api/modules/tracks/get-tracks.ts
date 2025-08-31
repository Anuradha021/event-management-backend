import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function getTracksHandler(req: Request, res: Response) {
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

    const { eventId, zoneId } = req.query;
    
    if (!eventId || !zoneId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId and zoneId are required" 
      });
    }

    const tracksSnapshot = await db.collection("events")
      .doc(eventId as string)
      .collection("zones")
      .doc(zoneId as string)
      .collection("tracks")
      .get();

    const tracks: any[] = [];
    tracksSnapshot.forEach((doc) => {
      tracks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      data: {
        tracks: tracks
      }
    });
  } catch (e: any) {
    console.error("Error fetching tracks:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch tracks" 
    });
  }
}

export default getTracksHandler;