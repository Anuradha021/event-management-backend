import { Request } from "express";
import { db } from "../config/firebase";
import { authenticateToken } from "../middlewares/authMiddleware";

export class SessionsService {
    public async createSession(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) return { authResult };

        const { eventId, zoneId, trackId } = req.params;
        const { title, description, speaker, startTime, endTime } = req.body;

        if (!title || !startTime || !endTime) {
            throw new Error("title, startTime, and endTime are required");
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
            throw new Error("End time must be after start time");
        }

        const sessionData = {
            title,
            description: description || "",
            speaker: speaker || "",
            startTime: start,
            endTime: end,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: authResult.uid,
        };

        const sessionRef = await db
            .collection("events").doc(eventId)
            .collection("zones").doc(zoneId)
            .collection("tracks").doc(trackId)
            .collection("sessions")
            .add(sessionData);

        return { sessionId: sessionRef.id, ...sessionData };
    }

    public async getSessions(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) return { authResult };

        const { eventId, zoneId, trackId } = req.params;

        if (!eventId || !zoneId || !trackId) {
            throw new Error("eventId, zoneId, and trackId are required");
        }

        const sessionsSnapshot = await db
            .collection("events").doc(eventId)
            .collection("zones").doc(zoneId)
            .collection("tracks").doc(trackId)
            .collection("sessions")
            .orderBy("startTime")
            .get();

        return sessionsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startTime: data.startTime?.toDate?.() || data.startTime,
                endTime: data.endTime?.toDate?.() || data.endTime,
            };
        });
    }

    public async updateSession(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) return { authResult };

        const { eventId, zoneId, trackId, sessionId } = req.params;
        const { title, description, speaker, startTime, endTime } = req.body;

        if (!eventId || !zoneId || !trackId || !sessionId) {
            throw new Error("eventId, zoneId, trackId, and sessionId are required");
        }

        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (end <= start) {
                throw new Error("End time must be after start time");
            }
        }

        const updateData: any = { updatedAt: new Date() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (speaker !== undefined) updateData.speaker = speaker;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (endTime !== undefined) updateData.endTime = new Date(endTime);

        await db
            .collection("events").doc(eventId)
            .collection("zones").doc(zoneId)
            .collection("tracks").doc(trackId)
            .collection("sessions").doc(sessionId)
            .update(updateData);

        return { sessionId, ...updateData };
    }

    public async deleteSession(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) return { authResult };

        const { eventId, zoneId, trackId, sessionId } = req.params;
        if (!eventId || !zoneId || !trackId || !sessionId) {
            throw new Error("eventId, zoneId, trackId, and sessionId are required");
        }

        await db
            .collection("events").doc(eventId)
            .collection("zones").doc(zoneId)
            .collection("tracks").doc(trackId)
            .collection("sessions").doc(sessionId)
            .delete();

        return { message: "Session deleted successfully" };
    }
}