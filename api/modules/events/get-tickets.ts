import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

async function getTicketsHandler(req: Request, res: Response) {
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

    const { eventId, userId } = req.query;
    
    let query: FirebaseFirestore.Query = db.collection("tickets");

if (eventId) {
  query = query.where("eventId", "==", eventId);
}

if (userId) {
  query = query.where("userId", "==", userId);
} else {
  query = query.where("userId", "==", authResult.uid);
}

    const ticketsSnapshot = await query.get();

    const convertTimestamp = (timestamp: any) => {
      if (!timestamp) return null;
      if (timestamp.toDate) return timestamp.toDate().toISOString();
      if (timestamp instanceof Date) return timestamp.toISOString();
      return timestamp;
    };

    const tickets = ticketsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        purchaseDate: convertTimestamp(data.purchaseDate),
        usedAt: convertTimestamp(data.usedAt),
        isUsed: data.status === 'used',
      };
    });

 
    tickets.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    res.status(200).json({
      success: true,
      data: {
        tickets
      }
    });
  } catch (e: any) {
    console.error("Error fetching tickets:", e);
    res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to fetch tickets" 
    });
  }
}

export default getTicketsHandler;
