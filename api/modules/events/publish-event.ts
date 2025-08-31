
import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";


export default async function publishEventHandler(req: Request, res: Response) {
  if (req.method === "OPTIONS") {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authResult = await authenticateToken(req);
    if (!authResult.success) {
      return res.status(401).json({ 
        success: false,
        error: authResult.error 
      });
    }

    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ 
        success: false,
        error: "Event ID is required" 
      });
    }

    const eventDoc = await db.collection('events').doc(eventId).get();
    
    if (!eventDoc.exists) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    const eventData = eventDoc.data();
    
    if (eventData?.organizerUid !== authResult.uid) {
      return res.status(403).json({ 
        success: false,
        error: "Access denied. You are not the organizer of this event" 
      });
    }

    await db.collection('events').doc(eventId).update({
      status: 'published',
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
      success: true,
      message: "Event published successfully"
    });
  } catch (e: any) {
    console.error("Error publishing event:", e);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to publish event"
    });
  }
}