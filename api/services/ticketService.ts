import { db } from "../config/firebase";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

export interface TicketType {
    id: string;
    eventId: string;
    name: string;
    description?: string;
    price: number;
    totalQuantity: number;
    soldQuantity: number;
    isActive?: boolean;
    createdAt?: any;
    availableQuantity?: number;
}

export interface Ticket {
    id: string;
    ticketTypeId: string;
    ticketTypeName: string;
    eventId: string;
    eventTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    price: number;
    qrCode: string;
    status: string;
    purchaseDate: any;
    usedAt: any;
    validatedBy: string | null;
}

export class TicketService {
    async createTicketType(data: {
        eventId: string;
        name: string;
        description: string;
        price: number;
        totalQuantity: number;
        createdBy: string;
    }) {
        const ticketTypeData = {
            eventId: data.eventId,
            name: data.name,
            description: data.description || '',
            price: parseFloat(data.price.toString()),
            totalQuantity: parseInt(data.totalQuantity.toString()),
            soldQuantity: 0,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: data.createdBy,
        };

        const ticketTypeRef = await db.collection("ticketTypes").add(ticketTypeData);

        return {
            id: ticketTypeRef.id,
            ...ticketTypeData,
            createdAt: new Date().toISOString()
        };
    }

    async getTicketTypes(eventId: string, availableOnly: boolean = false, organizerView: boolean = false) {
        let query: FirebaseFirestore.Query = db.collection("ticketTypes")
            .where("eventId", "==", eventId);

        if (organizerView && availableOnly) {
            query = query.where("isActive", "==", true)
                .where("totalQuantity", ">", 0);
        }

        const ticketTypesSnapshot = await query.orderBy("createdAt", "desc").get();

        return ticketTypesSnapshot.docs.map(doc => {
            const data = doc.data();
            const availableQuantity = (data.totalQuantity || 0) - (data.soldQuantity || 0);

            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                availableQuantity: availableOnly ? availableQuantity : undefined
            };
        });
    }

    async updateTicketType(ticketTypeId: string, updateData: {
        name: string;
        price: number;
        totalQuantity: number;
    }) {
        const ticketTypeRef = db.collection("ticketTypes").doc(ticketTypeId);

        await ticketTypeRef.update({
            ...updateData,
            updatedAt: new Date()
        });

        return { id: ticketTypeId, message: "Ticket type updated successfully" };
    }

    async deleteTicketType(ticketTypeId: string) {
        const ticketTypeRef = db.collection("ticketTypes").doc(ticketTypeId);
        await ticketTypeRef.delete();

        return { message: "Ticket type deleted successfully" };
    }

    async purchaseTicket(data: {
        ticketTypeId: string;
        eventId: string;
        eventTitle: string;
        userId: string;
        userName: string;
        userEmail: string;
    }) {
        return await db.runTransaction(async (transaction) => {
            const ticketTypeRef = db.collection("ticketTypes").doc(data.ticketTypeId);
            const ticketTypeDoc = await transaction.get(ticketTypeRef);

            if (!ticketTypeDoc.exists) {
                throw new Error("Ticket type not found");
            }

            const ticketTypeData = ticketTypeDoc.data();
            const soldQuantity = ticketTypeData?.soldQuantity || 0;
            const totalQuantity = ticketTypeData?.totalQuantity || 0;
            const price = ticketTypeData?.price || 0;

            if (soldQuantity >= totalQuantity) {
                throw new Error("No tickets available for this type");
            }

            transaction.update(ticketTypeRef, {
                soldQuantity: admin.firestore.FieldValue.increment(1)
            });

            const qrCode = uuidv4();
            const ticketData = {
                ticketTypeId: data.ticketTypeId,
                ticketTypeName: ticketTypeData?.name || "",
                eventId: data.eventId,
                eventTitle: data.eventTitle,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                price,
                qrCode,
                status: "active",
                purchaseDate: admin.firestore.FieldValue.serverTimestamp(),
                usedAt: null,
                validatedBy: null
            };

            const ticketRef = db.collection("tickets").doc();
            transaction.set(ticketRef, ticketData);

            return {
                ticketId: ticketRef.id,
                ...ticketData,
                purchaseDate: new Date().toISOString()
            };
        });
    }

    async getTickets(filters: {
        eventId?: string;
        userId?: string;
        organizerView?: boolean;
    }) {
        let query: FirebaseFirestore.Query = db.collection("tickets");

        if (filters.organizerView && filters.eventId) {
            query = query.where("eventId", "==", filters.eventId);
        } else if (filters.userId) {
            query = query.where("userId", "==", filters.userId);
            if (filters.eventId) {
                query = query.where("eventId", "==", filters.eventId);
            }
        }

        const ticketsSnapshot = await query.orderBy("purchaseDate", "desc").get();

        const convertTimestamp = (timestamp: any) => {
            if (!timestamp) return null;
            if (timestamp.toDate) return timestamp.toDate().toISOString();
            if (timestamp instanceof Date) return timestamp.toISOString();
            return timestamp;
        };

        return ticketsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                purchaseDate: convertTimestamp(data.purchaseDate),
                usedAt: convertTimestamp(data.usedAt),
                isUsed: data.status === 'used',
            };
        });
    }

    async getSoldTickets(eventId: string) {
        const ticketsSnapshot = await db.collection("tickets")
            .where("eventId", "==", eventId)
            .orderBy("purchaseDate", "desc")
            .get();

        const tickets = ticketsSnapshot.docs.map(doc => {
            const data = doc.data();

            const purchaseDate = data.purchaseDate ?
                (data.purchaseDate.toDate ? data.purchaseDate.toDate().toISOString() :
                    data.purchaseDate instanceof Date ? data.purchaseDate.toISOString() :
                        new Date(data.purchaseDate).toISOString()) :
                new Date().toISOString();

            const usedAt = data.usedAt ?
                (data.usedAt.toDate ? data.usedAt.toDate().toISOString() :
                    data.usedAt instanceof Date ? data.usedAt.toISOString() :
                        new Date(data.usedAt).toISOString()) :
                null;

            return {
                id: doc.id,
                ...data,
                purchaseDate,
                usedAt,
            };
        });

        return tickets;
    }

    async validateTicket(qrCode: string, validatedBy: string) {
        const ticketsSnapshot = await db.collection("tickets")
            .where("qrCode", "==", qrCode)
            .limit(1)
            .get();

        if (ticketsSnapshot.empty) {
            throw new Error("Ticket not found");
        }

        const ticketDoc = ticketsSnapshot.docs[0];
        const ticketData = ticketDoc.data();
        const ticketId = ticketDoc.id;

        if (ticketData.status === "used") {
            throw new Error("Ticket has already been used");
        }

        await db.collection("tickets").doc(ticketId).update({
            status: "used",
            usedAt: admin.firestore.FieldValue.serverTimestamp(),
            validatedBy
        });

        const updatedTicketDoc = await db.collection("tickets").doc(ticketId).get();
        const updatedTicketData = updatedTicketDoc.data();

        return {
            id: ticketId,
            ...updatedTicketData,
            purchaseDate: updatedTicketData?.purchaseDate?.toDate?.()?.toISOString() || new Date().toISOString(),
            usedAt: updatedTicketData?.usedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
    }

    async getAvailableTickets(eventId: string) {
        const ticketTypesSnapshot = await db.collection("ticketTypes")
            .where("eventId", "==", eventId)
            .get();

        return ticketTypesSnapshot.docs.map(doc => {
            const data = doc.data();
            const availableQuantity = (data.totalQuantity || 0) - (data.soldQuantity || 0);
            const isActive = data.isActive !== false;

            return {
                id: doc.id,
                eventId: data.eventId || '',
                name: data.name || '',
                description: data.description || '',
                price: data.price || 0,
                totalQuantity: data.totalQuantity || 0,
                soldQuantity: data.soldQuantity || 0,
                isActive: isActive,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                availableQuantity: availableQuantity
            };
        }).filter(ticket => ticket.isActive === true && ticket.availableQuantity > 0);
    }

    async getEventStats(eventId: string) {
        const ticketTypesSnapshot = await db.collection("ticketTypes")
            .where("eventId", "==", eventId)
            .get();

        const ticketTypes = ticketTypesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || "",
            totalQuantity: doc.data().totalQuantity || 0,
            soldQuantity: doc.data().soldQuantity || 0,
            price: doc.data().price || 0,
            ...doc.data()
        }));

        const ticketsSnapshot = await db.collection("tickets")
            .where("eventId", "==", eventId)
            .get();

        const tickets = ticketsSnapshot.docs.map(doc => ({
            ticketTypeId: doc.data().ticketTypeId || "",
            price: doc.data().price || 0,
            status: doc.data().status || "active",
            ...doc.data()
        }));

        const totalTicketsSold = tickets.length;
        const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
        const usedTickets = tickets.filter(ticket => ticket.status === "used").length;

        const statsByType = ticketTypes.map(type => {
            const typeTickets = tickets.filter(ticket => ticket.ticketTypeId === type.id);
            const typeRevenue = typeTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);

            return {
                typeId: type.id,
                typeName: type.name,
                totalQuantity: type.totalQuantity,
                soldQuantity: type.soldQuantity,
                revenue: typeRevenue,
                usedTickets: typeTickets.filter(t => t.status === "used").length
            };
        });

        return {
            totalTicketsSold,
            totalRevenue,
            usedTickets,
            statsByType,
            ticketTypes: ticketTypes.length
        };
    }
}