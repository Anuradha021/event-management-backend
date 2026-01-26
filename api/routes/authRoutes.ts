import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.post("/login", (req, res) => authController.login(req, res));
router.post("/signup", (req, res) => authController.signup(req, res));
router.get("/me", (req, res) => authController.me(req, res));

export default router;
