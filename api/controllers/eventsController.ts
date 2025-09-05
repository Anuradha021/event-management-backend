import { Request, Response } from "express";
import { EventsService } from "../services/eventsService";

export class EventsController {
  private eventsService: EventsService;

  constructor() {
    this.eventsService = new EventsService();
  }

  public checkApproval = async (req: Request, res: Response) => {
    try {
      const result = await this.eventsService.checkApproval(req);
      if ("authResult" in result && result.authResult && !result.authResult.success) {
        return res.status(401).json(result.authResult);
      }

      return res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public getAssignedEvents = async (req: Request, res: Response) => {
    try {
      const result = await this.eventsService.getAssignedEvents(req);
      if ("authResult" in result && !result.authResult.success) {
        return res.status(401).json(result.authResult);
      }
      return res.status(200).json({ success: true, data: { events: result } });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public getEventDetails = async (req: Request, res: Response) => {
    try {
      const { eventId } = req.query;
      if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ error: "Event ID is required" });
      }
      const result = await this.eventsService.getEventDetails(eventId);
      return res.status(200).json({ success: true, data: result });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public getPublishedEvents = async (req: Request, res: Response) => {
    try {
      const result = await this.eventsService.getPublishedEvents();
      return res.status(200).json({ success: true, data: { events: result } });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };

  public publishEvent = async (req: Request, res: Response) => {
    try {
      const result = await this.eventsService.publishEvent(req);
      if ("authResult" in result && result.authResult && !result.authResult.success) {
        return res.status(401).json(result.authResult);
      }

      return res.status(200).json({ success: true, ...result });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message });
    }
  };
}