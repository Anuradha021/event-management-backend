import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const adminController = new AdminController();

router.use(authMiddleware);

router.get("/event-requests", (req, res) => adminController.getEventRequests(req, res));
router.patch("/event-requests/:id/status", (req, res) => adminController.updateRequestStatus(req, res));
router.post("/event-requests/:id/approve", (req, res) => adminController.approveEventRequest(req, res));

router.get("/users", (req, res) => adminController.getUsers(req, res));
router.patch("/users/:id/role", (req, res) => adminController.updateUserRole(req, res));
router.post("/events", (req, res) => adminController.createEvent(req, res));

export default router;