import * as admin from "firebase-admin";
import { Request } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { db } from "../config/firebase";

export class StallsService {
    public async createStall(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId, trackId } = req.params;
        const { name, description } = req.body;

        const stallData = {
            name,
            description: description || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: authResult.uid,
        };

        const stallRef = await db
            .collection("events")
            .doc(eventId)
            .collection("zones")
            .doc(zoneId)
            .collection("tracks")
            .doc(trackId)
            .collection("stalls")
            .add(stallData);

        return { id: stallRef.id, ...stallData };
    }

    public async getStalls(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId, trackId } = req.params;

        const stallsSnapshot = await db
            .collection("events")
            .doc(eventId)
            .collection("zones")
            .doc(zoneId)
            .collection("tracks")
            .doc(trackId)
            .collection("stalls")
            .get();

        return stallsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
        }));
    }

    public async getStallDetails(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId, trackId, stallId } = req.params;

        const stallDoc = await db
            .collection("events")
            .doc(eventId)
            .collection("zones")
            .doc(zoneId)
            .collection("tracks")
            .doc(trackId)
            .collection("stalls")
            .doc(stallId)
            .get();

        if (!stallDoc.exists) {
            throw new Error("Stall not found");
        }

        return {
            id: stallDoc.id,
            ...stallDoc.data(),
            createdAt: stallDoc.data()?.createdAt?.toDate?.()?.toISOString(),
            updatedAt: stallDoc.data()?.updatedAt?.toDate?.()?.toISOString(),
        };
    }

    public async updateStall(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId, trackId, stallId } = req.params;
        const { name, description } = req.body;

        const stallData = {
            name,
            description: description || '',
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
            .collection("stalls")
            .doc(stallId)
            .update(stallData);

        return { id: stallId, ...stallData };
    }

    public async deleteStall(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            return { authResult };
        }

        const { eventId, zoneId, trackId, stallId } = req.params;

        await db
            .collection("events")
            .doc(eventId)
            .collection("zones")
            .doc(zoneId)
            .collection("tracks")
            .doc(trackId)
            .collection("stalls")
            .doc(stallId)
            .delete();

        return { message: "Stall deleted successfully" };
    }
}