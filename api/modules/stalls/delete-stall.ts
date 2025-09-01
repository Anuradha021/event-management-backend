import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function deleteStallHandler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await authenticateToken(req);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { stallId } = req.params;
    const { eventId, zoneId, trackId } = req.query;
    
    if (!eventId || !zoneId || !trackId || !stallId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId, zoneId, trackId, and stallId are required" 
      });
    }

    await db
      .collection("events")
      .doc(eventId as string)
      .collection("zones")
      .doc(zoneId as string)
      .collection("tracks")
      .doc(trackId as string)
      .collection("stalls")
      .doc(stallId as string)
      .delete();

    res.status(200).json({
      success: true,
      data: {
        message: "Stall deleted successfully"
      }
    });
  } catch (e: any) {
    console.error("Error deleting stall:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to delete stall" 
    });
  }
}

export default deleteStallHandler;