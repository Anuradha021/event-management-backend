import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function getZonesHandler(req: Request, res: Response) {
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

    const { eventId } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ 
        success: false, 
        error: "eventId parameter is required" 
      });
    }

    const zonesSnapshot = await db.collection("events")
      .doc(eventId as string)
      .collection("zones")
      .get();

    const zones = zonesSnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || doc.data().name || 'Unnamed Zone',
      description: doc.data().description || '',
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    res.status(200).json({
      success: true,
      data: {
        zones
      }
    });
  } catch (e: any) {
    console.error("Error fetching zones:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch zones" 
    });
  }
}

export default getZonesHandler;