import { Router } from "express";
import { EventsController } from "../controllers/eventsController";

const router = Router();
const eventsController = new EventsController();

router.get("/get-published-events", eventsController.getPublishedEvents);

export default router;