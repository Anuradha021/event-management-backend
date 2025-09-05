import { Request, Response } from "express";
import { TracksService } from "../services/trackService";

export class TracksController {
    private tracksService: TracksService;

    constructor() {
        this.tracksService = new TracksService();
    }

    public createTrack = async (req: Request, res: Response) => {
        try {
            const result = await this.tracksService.createTrack(req);
           

            return res.status(201).json({ success: true, data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public getTracks = async (req: Request, res: Response) => {
        try {
            const result = await this.tracksService.getTracks(req);
            
            return res.status(200).json({ success: true, data: { tracks: result } });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public updateTrack = async (req: Request, res: Response) => {
        try {
            const result = await this.tracksService.updateTrack(req);
           
            return res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };

    public deleteTrack = async (req: Request, res: Response) => {
        try {
            const result = await this.tracksService.deleteTrack(req);
            

            return res.status(200).json({ success: true, data: result });
        } catch (e: any) {
            return res.status(500).json({ success: false, error: e.message });
        }
    };
}
