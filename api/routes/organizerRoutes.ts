import { Router } from "express";
import { EventsController } from "../controllers/eventsController";

const router = Router();
const eventsController = new EventsController();

router.get("/get-assigned-events", eventsController.getAssignedEvents);
router.get("/check-approval", eventsController.checkApproval);
router.get("/get-event-details", eventsController.getEventDetails);
router.post("/publish-event", eventsController.publishEvent);
router.post("/submit-event-request", eventsController.submitEventRequest);

export default router;