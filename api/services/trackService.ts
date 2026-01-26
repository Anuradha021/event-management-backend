import { Request } from "express";
import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { authenticateToken } from "../middlewares/authMiddleware";

export class TracksService {
    public async createTrack(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId, title, description } = req.body;

        if (!eventId || !zoneId || !title) {
            throw new Error("eventId, zoneId, and title are required");
        }

        const trackData = {
            title,
            description: description || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: authResult.uid,
        };

        const trackRef = await db
            .collection("events")
            .doc(eventId)
            .collection("zones")
            .doc(zoneId)
            .collection("tracks")
            .add(trackData);

        return { id: trackRef.id, message: "Track created successfully" };
    }

    public async getTracks(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId } = req.query;
        if (!eventId || !zoneId) {
            throw new Error("eventId and zoneId are required");
        }

        const tracksSnapshot = await db
            .collection("events")
            .doc(eventId as string)
            .collection("zones")
            .doc(zoneId as string)
            .collection("tracks")
            .get();

        return tracksSnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title || doc.data().name || "Unnamed Track",
            description: doc.data().description || "",
            createdAt:
                doc.data().createdAt?.toDate?.()?.toISOString() ||
                new Date().toISOString(),
        }));
    }

    public async updateTrack(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { trackId } = req.params;
        const { eventId, zoneId, title, description } = req.body;

        if (!eventId || !zoneId || !trackId || !title) {
            throw new Error("eventId, zoneId, trackId, and title are required");
        }

        const trackData = {
            title,
            description: description || "",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedBy: authResult.uid,
        };

        await db
            .collection("events")
            .doc(eventId)
            .collection("zones")
            .doc(zoneId)
            .collection("tracks")
            .doc(trackId)
            .update(trackData);

        return { id: trackId, message: "Track updated successfully" };
    }

    public async deleteTrack(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { trackId } = req.params;
        const { eventId, zoneId } = req.query;

        if (!eventId || !zoneId || !trackId) {
            throw new Error("eventId, zoneId, and trackId are required");
        }

        await db
            .collection("events")
            .doc(eventId as string)
            .collection("zones")
            .doc(zoneId as string)
            .collection("tracks")
            .doc(trackId as string)
            .delete();

        return { message: "Track deleted successfully" };
    }
}
