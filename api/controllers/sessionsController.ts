import { Request, Response } from "express";
import { SessionsService } from "../services/sessionService";

export class SessionsController {
    private sessionsService: SessionsService;

    constructor() {
        this.sessionsService = new SessionsService();
    }

    public createSession = async (req: Request, res: Response) => {
        try {
            const result = await this.sessionsService.createSession(req);
            return res.status(201).json({ success: true, message: "Session created successfully", data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public getSessions = async (req: Request, res: Response) => {
        try {
            const result = await this.sessionsService.getSessions(req);
            return res.status(200).json({ success: true, data: { sessions: result } });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public updateSession = async (req: Request, res: Response) => {
        try {
            const result = await this.sessionsService.updateSession(req);
            return res.status(200).json({ success: true, message: "Session updated successfully", data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public deleteSession = async (req: Request, res: Response) => {
        try {
            const result = await this.sessionsService.deleteSession(req);
            return res.status(200).json({ success: true, ...result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };
}