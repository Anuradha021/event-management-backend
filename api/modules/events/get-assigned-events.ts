import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

export default async function getAssignedEventsHandler(req: Request, res: Response) {
  if (req.method === "OPTIONS") {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== "GET") {
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

    const snapshot = await db.collection('events')
      .where('assignedOrganizerUid', '==', authResult.uid)
      .where('status', 'in', ['approved', 'published', 'assigned'])
      .get();

    const events = snapshot.docs.map(doc => {
      const data = doc.data();
    
      const convertTimestamp = (timestamp: any): string | null => {
        if (!timestamp) return null;
        

        if (typeof timestamp.toDate === 'function') {
          return timestamp.toDate().toISOString();
        }

        if (timestamp._seconds) {
          return new Date(timestamp._seconds * 1000).toISOString();
        }
        
 
        if (typeof timestamp === 'string' || timestamp instanceof Date) {
          return new Date(timestamp).toISOString();
        }
        
        return null;
      };

      return {
        id: doc.id,
        eventId: doc.id,
        eventTitle: data.eventTitle || data.title,
        eventDescription: data.eventDescription || data.description,
        eventDate: convertTimestamp(data.eventDate),
        location: data.location,
        status: data.status,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        organizerName: data.organizerName,
        organizerEmail: data.organizerEmail,
        organizerUid: data.organizerUid,
        assignedOrganizerUid: data.assignedOrganizerUid
      };
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
      success: true,
      data: {
        events
      }
    });
  } catch (e: any) {
    console.error("Error fetching assigned events:", e);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch assigned events"
    });
  }
}