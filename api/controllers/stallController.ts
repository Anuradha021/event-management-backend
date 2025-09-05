import { Request, Response } from "express";
import { StallsService } from "../services/stallService";

export class StallsController {
    private stallsService: StallsService;

    constructor() {
        this.stallsService = new StallsService();
    }

    public createStall = async (req: Request, res: Response) => {
        try {
            const result = await this.stallsService.createStall(req);
            return res.status(201).json({ success: true, data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public getStalls = async (req: Request, res: Response) => {
        try {
            const result = await this.stallsService.getStalls(req);
            return res.status(200).json({ success: true, data: { stalls: result } });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public getStallDetails = async (req: Request, res: Response) => {
        try {
            const result = await this.stallsService.getStallDetails(req);
            return res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            if (e.message === "Stall not found") {
                return res.status(404).json({ success: false, error: e.message });
            }
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public updateStall = async (req: Request, res: Response) => {
        try {
            const result = await this.stallsService.updateStall(req);
            return res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public deleteStall = async (req: Request, res: Response) => {
        try {
            const result = await this.stallsService.deleteStall(req);
            return res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };
}