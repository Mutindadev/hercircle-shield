import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { GoogleProfile } from "./types/googleTypes";
import { ENV } from "./env";
import * as db from "../db";

// Configure Google OAuth 2.0 Strategy
export function configurePassport() {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
        console.warn(
            "[Passport] Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
        );
        return;
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: ENV.googleClientId,
                clientSecret: ENV.googleClientSecret,
                callbackURL: ENV.googleCallbackUrl,
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile: GoogleProfile, done) => {
                try {
                    const googleId = profile.id;
                    const email = profile.emails?.[0]?.value ?? null;
                    const name = profile.displayName || profile.name?.givenName || "User";
                    const photoUrl = profile.photos?.[0]?.value ?? null;

                    // Upsert user in database
                    await db.upsertUser({
                        openId: googleId, // Using openId field for Google ID
                        name,
                        email,
                        loginMethod: "google",
                        lastSignedIn: new Date(),
                    });

                    const user = await db.getUserByOpenId(googleId);

                    if (!user) {
                        return done(new Error("Failed to create or retrieve user"), undefined);
                    }

                    return done(null, user);
                } catch (error) {
                    console.error("[Passport] Google OAuth error:", error);
                    return done(error as Error, undefined);
                }
            }
        )
    );

    // Serialize user to session
    passport.serializeUser((user: any, done) => {
        done(null, user.openId);
    });

    // Deserialize user from session
    passport.deserializeUser(async (openId: string, done) => {
        try {
            const user = await db.getUserByOpenId(openId);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

    console.log("[Passport] Google OAuth 2.0 strategy configured");
}
