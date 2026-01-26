import { Request } from "express";
import { db } from "../config/firebase";
import { authenticateToken } from "../middlewares/authMiddleware";
import * as admin from "firebase-admin";

export class ZonesService {
  public async createZone(req: Request) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { success: false, error: authResult.error };

    const { eventId, title, description } = req.body;
    if (!eventId || !title) {
      return { success: false, error: "eventId and title are required" };
    }

    const zoneData = {
      title,
      description: description || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: authResult.uid,
    };

    const zoneRef = await db.collection("events")
      .doc(eventId)
      .collection("zones")
      .add(zoneData);

    return { success: true, data: { id: zoneRef.id, message: "Zone created successfully" } };
  }

  public async getZones(req: Request) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { success: false, error: authResult.error };

    const { eventId } = req.query;
    if (!eventId) return { success: false, error: "eventId parameter is required" };

    const zonesSnapshot = await db.collection("events")
      .doc(eventId as string)
      .collection("zones")
      .get();

    const zones = zonesSnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || "Unnamed Zone",
      description: doc.data().description || "",
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
    }));

    return { success: true, data: { zones } };
  }

  public async updateZone(req: Request) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { success: false, error: authResult.error };

    const { zoneId } = req.params;
    const { eventId, title, description } = req.body;
    if (!eventId || !zoneId || !title) {
      return { success: false, error: "eventId, zoneId and title are required" };
    }

    const zoneData = {
      title,
      description: description || "",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: authResult.uid,
    };

    await db.collection("events")
      .doc(eventId)
      .collection("zones")
      .doc(zoneId)
      .update(zoneData);

    return { success: true, data: { id: zoneId, message: "Zone updated successfully" } };
  }

  public async deleteZone(req: Request) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { success: false, error: authResult.error };

    const { zoneId } = req.params;
    const { eventId } = req.query;
    if (!eventId || !zoneId) {
      return { success: false, error: "eventId and zoneId are required" };
    }

    await db.collection("events")
      .doc(eventId as string)
      .collection("zones")
      .doc(zoneId as string)
      .delete();

    return { success: true, data: { message: "Zone deleted successfully" } };
  }
}
