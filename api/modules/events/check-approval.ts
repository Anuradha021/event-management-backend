import { Request, Response } from "express";
import { authenticateToken } from "../../middlewares/authMiddleware";
import { db } from "../../config/firebase";

export default async function checkApprovalHandler(req: Request, res: Response) {
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

    const userDoc = await db.collection('users').doc(authResult.uid!).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const userData = userDoc.data();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json({
      success: true,
      data: {
        isOrganizer: userData?.isOrganizer || false,
        popupShown: userData?.popupShown || false
      }
    });
  } catch (e: any) {
    console.error("Error checking approval status:", e);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(500).json({ 
      success: false, 
      error: e.message || "Failed to check approval status"
    });
  }
}