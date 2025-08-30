import { Request, Response } from "express";
import { db, auth } from "./firebase";  


export default async function healthCheckHandler(req: Request, res: Response) {
  try {
   
    await db.listCollections();

    
    await auth.listUsers(1);

    res.status(200).json({
      status: "ok",
      server: "running",
      firebase: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Health check failed:", error.message);

    res.status(500).json({
      status: "error",
      server: "running",
      firebase: "not connected",
      error: error.message,
    });
  }
}
