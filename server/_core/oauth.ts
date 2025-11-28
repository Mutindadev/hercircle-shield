import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import passport from "passport";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

export function registerOAuthRoutes(app: Express) {
  // Initiate Google OAuth flow
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Google OAuth callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any;

        if (!user || !user.openId) {
          res.status(400).json({ error: "Authentication failed" });
          return;
        }

        // Create session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        res.redirect(302, "/");
      } catch (error) {
        console.error("[OAuth] Callback failed", error);
        res.status(500).json({ error: "OAuth callback failed" });
      }
    }
  );

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("[OAuth] Logout error", err);
        res.status(500).json({ error: "Logout failed" });
        return;
      }

      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.json({ success: true });
    });
  });
}
