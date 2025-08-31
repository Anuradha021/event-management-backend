import { Request, Response } from "express";
import { db } from "../../config/firebase";

export default async function getPublishedEventsHandler(req: Request, res: Response) {
  
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
    const snapshot = await db.collection('events')
      .where('status', '==', 'published')
      .orderBy('createdAt')
      .get();

    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      
      const convertTimestamp = (timestamp: any) => {
        if (!timestamp) return null;
        if (timestamp.toDate) return timestamp.toDate().toISOString();
        if (timestamp instanceof Date) return timestamp.toISOString();
        return timestamp;
      };

      return {
        id: doc.id,
        ...data,
        eventDate: convertTimestamp(data.eventDate),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        publishedAt: convertTimestamp(data.publishedAt),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        events
      }
    });
  } catch (e: any) {
    console.error("Error fetching published events:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch published events"
    });
  }
}