import { Request, Response } from "express";
import { db } from "../config/firebase";
import { authenticateToken, AuthResult } from "../middlewares/authMiddleware";

interface EventRequest {
    id: string;
    eventTitle?: string;
    eventDescription?: string;
    organizerEmail?: string;
    location?: string;
    status?: string;
    createdAt?: any;
    eventDate?: any;
    organizerName?: string;
    organizerUid?: string;
    assignedOrganizerEmail?: string;
    [key: string]: any;
}

export class AdminController {
    async getEventRequests(req: Request, res: Response) {
        try {
            const authResult: AuthResult = await authenticateToken(req);
            if (!authResult.success) {
                return res.status(401).json({ error: authResult.error });
            }
            if (!authResult.user?.isSystemAdmin && authResult.user?.role !== 'admin') {
                return res.status(403).json({ error: "Access denied. Admin required." });
            }
            const { status, search } = req.query;
            let statusValue: string | undefined = undefined;
            if (status && status !== 'all') {
                statusValue = status as string;
            }
            try {
                let query: any = db.collection("event_requests");
                if (statusValue) {
                    query = query.where("status", "==", statusValue);
                }
                query = query.orderBy("createdAt", "desc");
                const snapshot = await query.get();
                let requests: EventRequest[] = snapshot.docs.map((doc: any) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        eventTitle: data.eventTitle,
                        eventDescription: data.eventDescription,
                        organizerEmail: data.organizerEmail,
                        location: data.location,
                        status: data.status,
                        createdAt: data.createdAt,
                        eventDate: data.eventDate,
                        organizerName: data.organizerName,
                        organizerUid: data.organizerUid,
                        assignedOrganizerEmail: data.assignedOrganizerEmail,
                        ...data
                    };
                });
                if (search) {
                    const searchTerm = (search as string).toLowerCase();
                    requests = requests.filter(request =>
                        (request.eventTitle?.toLowerCase() || '').includes(searchTerm) ||
                        (request.organizerEmail?.toLowerCase() || '').includes(searchTerm) ||
                        (request.location?.toLowerCase() || '').includes(searchTerm) ||
                        (request.organizerName?.toLowerCase() || '').includes(searchTerm)
                    );
                }
                return res.status(200).json({ requests });
            } catch (indexError: any) {
                const snapshot = await db.collection("event_requests").get();
                let requests: EventRequest[] = snapshot.docs.map((doc: any) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        eventTitle: data.eventTitle,
                        eventDescription: data.eventDescription,
                        organizerEmail: data.organizerEmail,
                        location: data.location,
                        status: data.status,
                        createdAt: data.createdAt,
                        eventDate: data.eventDate,
                        organizerName: data.organizerName,
                        organizerUid: data.organizerUid,
                        assignedOrganizerEmail: data.assignedOrganizerEmail,
                        ...data
                    };
                });
                if (status && status !== 'all') {
                    requests = requests.filter(request => request.status === status);
                }
                if (search) {
                    const searchTerm = (search as string).toLowerCase();
                    requests = requests.filter(request =>
                        (request.eventTitle?.toLowerCase() || '').includes(searchTerm) ||
                        (request.organizerEmail?.toLowerCase() || '').includes(searchTerm) ||
                        (request.location?.toLowerCase() || '').includes(searchTerm) ||
                        (request.organizerName?.toLowerCase() || '').includes(searchTerm)
                    );
                }
                requests.sort((a: any, b: any) => {
                    const getDate = (request: any): Date => {
                        if (!request.createdAt) return new Date(0);
                        if (typeof request.createdAt === 'object' && request.createdAt.toDate) {
                            return request.createdAt.toDate();
                        }
                        if (typeof request.createdAt === 'string') {
                            return new Date(request.createdAt);
                        }
                        if (request.createdAt instanceof Date) {
                            return request.createdAt;
                        }
                        return new Date(0);
                    };
                    const dateA = getDate(a);
                    const dateB = getDate(b);
                    return dateB.getTime() - dateA.getTime();
                });
                return res.status(200).json({ requests });
            }
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Failed to fetch event requests" });
        }
    }

    async updateRequestStatus(req: Request, res: Response) {
        try {
            const authResult: AuthResult = await authenticateToken(req);
            if (!authResult.success) {
                return res.status(401).json({ error: authResult.error });
            }
            if (!authResult.user?.isSystemAdmin && authResult.user?.role !== 'admin') {
                return res.status(403).json({ error: "Access denied. Admin required." });
            }
            const { id } = req.params;
            const { status, feedback } = req.body;
            if (!id || !status) {
                return res.status(400).json({ error: "Missing required fields" });
            }
            const requestRef = db.collection("event_requests").doc(id);
            const requestDoc = await requestRef.get();
            if (!requestDoc.exists) {
                return res.status(404).json({ error: "Event request not found" });
            }
            await requestRef.update({
                status,
                feedback: feedback || "",
                reviewedBy: authResult.user.uid,
                reviewedAt: new Date()
            });
            return res.status(200).json({ message: "Event request updated successfully" });
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Failed to update event request" });
        }
    }

    async approveEventRequest(req: Request, res: Response) {
        try {
            const authResult: AuthResult = await authenticateToken(req);
            if (!authResult.success) {
                return res.status(401).json({ error: authResult.error });
            }
            if (!authResult.user?.isSystemAdmin && authResult.user?.role !== 'admin') {
                return res.status(403).json({ error: "Access denied. Admin required." });
            }
            const { id } = req.params;
            const requestRef = db.collection("event_requests").doc(id);
            const requestDoc = await requestRef.get();
            if (!requestDoc.exists) {
                return res.status(404).json({ error: "Event request not found" });
            }
            const requestData = requestDoc.data();
            const eventRef = db.collection("events").doc();
            await eventRef.set({
                ...requestData,
                id: eventRef.id,
                status: "approved",
                approvedBy: authResult.user.uid,
                approvedAt: new Date(),
                createdAt: new Date(),
                assignedOrganizerUid: requestData?.requesterUid,
            });
            await requestRef.update({
                status: "approved",
                approvedBy: authResult.user.uid,
                approvedAt: new Date()
            });
            return res.status(200).json({ message: "Event approved and created successfully" });
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Failed to approve event request" });
        }
    }

    async getUsers(req: Request, res: Response) {
        try {
            const authResult: AuthResult = await authenticateToken(req);
            if (!authResult.success) {
                return res.status(401).json({ error: authResult.error });
            }
            if (!authResult.user?.isSystemAdmin) {
                return res.status(403).json({ error: "Access denied. System admin required." });
            }
            const snapshot = await db.collection("users").get();
            const users = snapshot.docs.map(doc => {
                const data = doc.data();
                const isSystemAdmin = data.email === "admin21@event.com";
                return {
                    id: doc.id,
                    ...data,
                    role: isSystemAdmin ? "SYSTEM_ADMIN" : (data.role || "USER"),
                    isSystemAdmin: isSystemAdmin
                };
            });
            return res.status(200).json({ users });
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Failed to fetch users" });
        }
    }
    async updateUserRole(req: Request, res: Response) {
        try {
            const authResult: AuthResult = await authenticateToken(req);
            if (!authResult.success) {
                return res.status(401).json({ error: authResult.error });
            }
            if (!authResult.user?.isSystemAdmin) {
                return res.status(403).json({ error: "Access denied. System admin required." });
            }
            const { id } = req.params;
            const { role, isOrganizer } = req.body;
            if (!id) {
                return res.status(400).json({ error: "User ID is required" });
            }
            const userRef = db.collection("users").doc(id);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return res.status(404).json({ error: "User not found" });
            }
            const updateData: any = {};
            if (role !== undefined) updateData.role = role;
            if (isOrganizer !== undefined) updateData.isOrganizer = isOrganizer;
            await userRef.update(updateData);
            return res.status(200).json({ message: "User role updated successfully" });
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Failed to update user role" });
        }
    }

    async createEvent(req: Request, res: Response) {
        try {
            const authResult: AuthResult = await authenticateToken(req);
            if (!authResult.success) {
                return res.status(401).json({ error: authResult.error });
            }
            if (!authResult.user?.isSystemAdmin && authResult.user?.role !== 'admin') {
                return res.status(403).json({ error: "Access denied. Admin required." });
            }
            const {
                eventTitle,
                eventDescription,
                eventDate,
                location,
                organizerEmail,
                category
            } = req.body;
            if (!eventTitle || !eventDescription || !eventDate || !location || !organizerEmail || !category) {
                return res.status(400).json({ error: "All fields are required" });
            }
            const eventRef = db.collection("events").doc();
            await eventRef.set({
                id: eventRef.id,
                eventTitle,
                eventDescription,
                eventDate: new Date(eventDate),
                location,
                organizerEmail,
                category,
                status: "approved",
                createdBy: authResult.user.uid,
                createdAt: new Date(),
                approvedBy: authResult.user.uid,
                approvedAt: new Date()
            });
            return res.status(201).json({ message: "Event created successfully", eventId: eventRef.id });
        } catch (e: any) {
            return res.status(500).json({ error: e.message || "Failed to create event" });
        }
    }
}