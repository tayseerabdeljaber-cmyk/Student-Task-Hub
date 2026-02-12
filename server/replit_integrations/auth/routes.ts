import type { Express } from "express";
import type { User } from "@shared/models/auth";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

const LOCAL_DEV_USER_ID = "local-dev-user";
const LOCAL_DEV_USER_EMAIL = "local.dev@studenthub.local";

function getLocalDevUser(): User {
  return {
    id: process.env.LOCAL_DEV_USER_ID ?? LOCAL_DEV_USER_ID,
    email: process.env.LOCAL_DEV_USER_EMAIL ?? LOCAL_DEV_USER_EMAIL,
    firstName: process.env.LOCAL_DEV_USER_FIRST_NAME ?? "Local",
    lastName: process.env.LOCAL_DEV_USER_LAST_NAME ?? "Developer",
    profileImageUrl: process.env.LOCAL_DEV_USER_PROFILE_IMAGE_URL ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

export function registerLocalDevAuthRoutes(app: Express): void {
  app.get("/api/login", (_req, res) => {
    res.redirect("/");
  });

  app.get("/api/callback", (_req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (_req, res) => {
    res.redirect("/");
  });

  app.get("/api/auth/user", (_req, res) => {
    res.json(getLocalDevUser());
  });
}
