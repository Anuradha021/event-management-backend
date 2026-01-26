import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    getUserProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user?.uid;

            if (!userId) {
                res.status(401).json({ error: "User not authenticated" });
                return;
            }

            const userProfile = await this.userService.getUserProfile(userId);
            res.status(200).json(userProfile); // This should send the data
        } catch (error: any) {
            console.error('Profile error:', error);
            res.status(500).json({
                error: error.message || "Internal server error"
            });
        }
    };
}