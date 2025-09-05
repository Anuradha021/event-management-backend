import { db } from "../config/firebase";
import { authenticateToken } from "../middlewares/authMiddleware";

export class EventsService {
  async checkApproval(req: any) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { authResult };

    const userDoc = await db.collection("users").doc(authResult.uid!).get();
    if (!userDoc.exists) throw new Error("User not found");

    const userData = userDoc.data();
    return {
      isOrganizer: userData?.isOrganizer || false,
      popupShown: userData?.popupShown || false,
    };
  }

  async getAssignedEvents(req: any) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { authResult };

    const snapshot = await db
      .collection("events")
      .where("assignedOrganizerUid", "==", authResult.uid)
      .where("status", "in", ["approved", "published", "assigned"])
      .get();

    const convertTimestamp = (timestamp: any): string | null => {
      if (!timestamp) return null;
      if (typeof timestamp.toDate === "function") {
        return timestamp.toDate().toISOString();
      }
      if (timestamp._seconds) {
        return new Date(timestamp._seconds * 1000).toISOString();
      }
      if (typeof timestamp === "string" || timestamp instanceof Date) {
        return new Date(timestamp).toISOString();
      }
      return null;
    };

    return snapshot.docs.map((doc) => {
      const data = doc.data();
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
        assignedOrganizerUid: data.assignedOrganizerUid,
      };
    });
  }

  async getEventDetails(eventId: string) {
    const doc = await db.collection("events").doc(eventId).get();
    if (!doc.exists) throw new Error("Event not found");

    const eventData = doc.data();
    return {
      id: doc.id,
      ...eventData,
      eventDate: eventData?.eventDate?.toDate?.()?.toISOString?.(),
      createdAt: eventData?.createdAt?.toDate?.()?.toISOString?.(),
      updatedAt: eventData?.updatedAt?.toDate?.()?.toISOString?.(),
    };
  }

  async getPublishedEvents() {
    const snapshot = await db
      .collection("events")
      .where("status", "==", "published")
      .orderBy("createdAt")
      .get();

    const convertTimestamp = (timestamp: any) => {
      if (!timestamp) return null;
      if (timestamp.toDate) return timestamp.toDate().toISOString();
      if (timestamp instanceof Date) return timestamp.toISOString();
      return timestamp;
    };

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        eventDate: convertTimestamp(data.eventDate),
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        publishedAt: convertTimestamp(data.publishedAt),
      };
    });
  }

  async publishEvent(req: any) {
    const authResult = await authenticateToken(req);
    if (!authResult.success) return { authResult };

    const { eventId } = req.body;
    if (!eventId) throw new Error("Event ID is required");

    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) throw new Error("Event not found");

    const eventData = eventDoc.data();
    if (eventData?.organizerUid !== authResult.uid) {
      throw new Error("Access denied. You are not the organizer of this event");
    }

    await db.collection("events").doc(eventId).update({
      status: "published",
      publishedAt: new Date(),
      updatedAt: new Date(),
    });

    return { message: "Event published successfully" };
  }
}