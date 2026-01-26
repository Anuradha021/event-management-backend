import { Request, Response } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { TicketService } from "../services/ticketService";

export class TicketController {
    private ticketService: TicketService;

    constructor() {
        this.ticketService = new TicketService();
    }

    private setCorsHeaders(res: Response) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    private handleOptionsRequest(res: Response) {
        this.setCorsHeaders(res);
        return res.status(200).end();
    }

    private async authenticateRequest(req: Request) {
        const authResult = await authenticateToken(req);
        if (!authResult.success) {
            throw new Error(authResult.error);
        }
        return authResult;
    }

    async createTicketType(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

        try {
            const authResult = await this.authenticateRequest(req);
            const { eventId, name, description, price, totalQuantity } = req.body;

            if (!authResult.uid) {
                return res.status(401).json({ success: false, error: "User ID not found" });
            }

            if (!eventId || !name || price === undefined || totalQuantity === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "eventId, name, price, and totalQuantity are required"
                });
            }

            const result = await this.ticketService.createTicketType({
                eventId,
                name,
                description,
                price,
                totalQuantity,
                createdBy: authResult.uid
            });

            res.status(201).json({ success: true, data: result });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to create ticket type" });
        }
    }

    async getTicketTypes(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

        try {
            const authResult = await this.authenticateRequest(req);
            const { eventId, availableOnly, organizer } = req.query;

            if (!eventId) {
                return res.status(400).json({ success: false, error: "eventId is required" });
            }

            const ticketTypes = await this.ticketService.getTicketTypes(
                eventId as string,
                availableOnly === "true",
                organizer === "true"
            );

            res.status(200).json({ success: true, data: { ticketTypes } });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to get ticket types" });
        }
    }

    async updateTicketType(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

        try {
            await this.authenticateRequest(req);
            const { ticketTypeId } = req.params;
            const { name, price, totalQuantity } = req.body;

            if (!ticketTypeId || !name || price === undefined || totalQuantity === undefined) {
                return res.status(400).json({
                    success: false,
                    error: "ticketTypeId, name, price, and totalQuantity are required"
                });
            }

            const result = await this.ticketService.updateTicketType(ticketTypeId, {
                name,
                price,
                totalQuantity
            });

            res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to update ticket type" });
        }
    }

    async deleteTicketType(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

        try {
            await this.authenticateRequest(req);
            const { ticketTypeId } = req.params;

            if (!ticketTypeId) {
                return res.status(400).json({ success: false, error: "ticketTypeId is required" });
            }

            const result = await this.ticketService.deleteTicketType(ticketTypeId);
            res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to delete ticket type" });
        }
    }

    async purchaseTicket(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

        try {
            const authResult = await this.authenticateRequest(req);
            const { ticketTypeId, eventId, eventTitle } = req.body;

            if (!ticketTypeId || !eventId || !eventTitle) {
                return res.status(400).json({
                    success: false,
                    error: "ticketTypeId, eventId, and eventTitle are required"
                });
            }

            if (!authResult.uid) {
                return res.status(401).json({ success: false, error: "User ID not found" });
            }

            const result = await this.ticketService.purchaseTicket({
                ticketTypeId,
                eventId,
                eventTitle,
                userId: authResult.uid,
                userName: authResult.userName || "User",
                userEmail: authResult.userEmail || ""
            });

            res.status(201).json({ success: true, data: result });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to purchase ticket" });
        }
    }

    async getTickets(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

        try {
            const authResult = await this.authenticateRequest(req);
            const { eventId, userId, organizer } = req.query;

            const tickets = await this.ticketService.getTickets({
                eventId: eventId as string,
                userId: (userId || authResult.uid) as string,
                organizerView: organizer === "true"
            });

            res.status(200).json({ success: true, data: { tickets } });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to fetch tickets" });
        }
    }

    async getSoldTickets(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

        try {
            await this.authenticateRequest(req);
            const { eventId } = req.query;

            if (!eventId) {
                return res.status(400).json({ success: false, error: "eventId is required" });
            }

            const tickets = await this.ticketService.getSoldTickets(eventId as string);

            res.status(200).json({
                success: true,
                data: {
                    tickets
                }
            });

        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to get sold tickets" });
        }
    }

    async validateTicket(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

        try {
            const authResult = await this.authenticateRequest(req);
            const { qrCode } = req.body;

            if (!qrCode) {
                return res.status(400).json({ success: false, error: "QR code is required" });
            }

            if (!authResult.uid) {
                return res.status(401).json({ success: false, error: "User ID not found" });
            }
            const result = await this.ticketService.validateTicket(qrCode, authResult.uid);
            res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to validate ticket" });
        }
    }

    async getAvailableTickets(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

        try {
            await this.authenticateRequest(req);
            const { eventId } = req.query;

            if (!eventId) {
                return res.status(400).json({ success: false, error: "eventId is required" });
            }

            const tickets = await this.ticketService.getAvailableTickets(eventId as string);
            res.status(200).json({ success: true, data: { tickets } });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to get available tickets" });
        }
    }

    async getEventStats(req: Request, res: Response) {
        this.setCorsHeaders(res);

        if (req.method === "OPTIONS") return this.handleOptionsRequest(res);
        if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

        try {
            await this.authenticateRequest(req);
            const { eventId } = req.query;

            if (!eventId) {
                return res.status(400).json({ success: false, error: "eventId is required" });
            }

            const stats = await this.ticketService.getEventStats(eventId as string);
            res.status(200).json({ success: true, data: stats });
        } catch (e: any) {
            res.status(500).json({ success: false, error: e.message || "Failed to get event stats" });
        }
    }
}