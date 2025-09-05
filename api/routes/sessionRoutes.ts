import { Router } from "express";
import { SessionsController } from "../controllers/sessionsController";

const router = Router();
const sessionsController = new SessionsController();

router.post("/:eventId/zones/:zoneId/tracks/:trackId/sessions", sessionsController.createSession);
router.get("/:eventId/zones/:zoneId/tracks/:trackId/sessions", sessionsController.getSessions);
router.put("/:eventId/zones/:zoneId/tracks/:trackId/sessions/:sessionId", sessionsController.updateSession);
router.delete("/:eventId/zones/:zoneId/tracks/:trackId/sessions/:sessionId", sessionsController.deleteSession);

export default router;