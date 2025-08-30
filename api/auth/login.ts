import { Request, Response } from "express";
import admin from "firebase-admin";

export default async function loginHandler(req: Request, res: Response) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const user = await admin.auth().getUserByEmail(email);
    const customToken = await admin.auth().createCustomToken(user.uid);

    res.status(200).json({ token: customToken, uid: user.uid });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Login failed" });
  }
}