import { Request, Response } from "express";
import { ZonesService } from "../services/zoneService";

export class ZonesController {
  private zonesService: ZonesService;

  constructor() {
    this.zonesService = new ZonesService();
  }

  public createZone = async (req: Request, res: Response) => {
    try {
      const result = await this.zonesService.createZone(req);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public getZones = async (req: Request, res: Response) => {
    try {
      const result = await this.zonesService.getZones(req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public updateZone = async (req: Request, res: Response) => {
    try {
      const result = await this.zonesService.updateZone(req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public deleteZone = async (req: Request, res: Response) => {
    try {
      const result = await this.zonesService.deleteZone(req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };
}