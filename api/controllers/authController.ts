import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Login failed" });
    }
  }

  async signup(req: Request, res: Response) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const result = await authService.signup(email, password, name, role);
      return res.status(201).json({ message: "User created", ...result });
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Signup failed" });
    }
  }

  async me(req: Request, res: Response) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const result = await authService.getUserProfile(token);

      return res.status(200).json(result);
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Failed to fetch user" });
    }
  }
}