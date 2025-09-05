import admin from "firebase-admin";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    isOrganizer: boolean;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

export class UserService {
    async getUserProfile(userId: string): Promise<UserProfile> {
        const userDoc = await admin.firestore()
            .collection("users")
            .doc(userId)
            .get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }

        const userData = userDoc.data();

        return {
            id: userDoc.id,
            name: userData?.name || userData?.displayName || "User",
            email: userData?.email || "",
            isOrganizer: userData?.isOrganizer || false,
            role: userData?.role || "user",
            createdAt: userData?.createdAt?.toDate().toISOString(),
            updatedAt: userData?.updatedAt?.toDate().toISOString()
        };
    }
}