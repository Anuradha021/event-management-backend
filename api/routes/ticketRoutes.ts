import { Router } from "express";
import { TicketController } from "../controllers/ticketController";

const router = Router();
const ticketController = new TicketController();

router.post("/types", (req, res) => ticketController.createTicketType(req, res));
router.get("/types", (req, res) => ticketController.getTicketTypes(req, res));
router.put("/types/:ticketTypeId", (req, res) => ticketController.updateTicketType(req, res));
router.delete("/types/:ticketTypeId", (req, res) => ticketController.deleteTicketType(req, res));

router.get("/", (req, res) => ticketController.getTickets(req, res));
router.post("/purchase", (req, res) => ticketController.purchaseTicket(req, res));
router.get("/sold", (req, res) => ticketController.getSoldTickets(req, res));
router.post("/validate", (req, res) => ticketController.validateTicket(req, res));
router.get("/available", (req, res) => ticketController.getAvailableTickets(req, res));

router.get("/stats", (req, res) => ticketController.getEventStats(req, res));

export default router;