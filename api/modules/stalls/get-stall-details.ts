import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function getStallDetailsHandler(req: Request, res: Response) {
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

    const { eventId, zoneId, trackId, stallId } = req.query;
    
    if (!eventId || !zoneId || !trackId || !stallId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, trackId, and stallId are required" 
      });
    }

    const stallDoc = await db
      .collection("events")
      .doc(eventId as string)
      .collection("zones")
      .doc(zoneId as string)
      .collection("tracks")
      .doc(trackId as string)
      .collection("stalls")
      .doc(stallId as string)
      .get();

    if (!stallDoc.exists) {
      return res.status(404).json({ 
        success: false,
        error: "Stall not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: stallDoc.id,
        ...stallDoc.data(),
        createdAt: stallDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: stallDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
    });
  } catch (e: any) {
    console.error("Error fetching stall details:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch stall details" 
    });
  }
}

export default getStallDetailsHandler;