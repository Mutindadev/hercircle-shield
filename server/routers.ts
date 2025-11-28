import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createIncident,
  getIncidentsByUserId,
  getIncidentById,
  addTrustedContact,
  getTrustedContacts,
  deleteTrustedContact,
  createCircle,
  getUserCircles,
  addCircleMember,
  createChatMessage,
  getCircleMessages,
  logDetection,
  getUserDetectionStats,
  createContentHash,
  checkContentHash,
  createTakedownRequest,
  getTakedownRequests,
  createLegalCase,
  getLegalCases,
  getUserSettings,
  upsertUserSettings,
  addToPeerMatchQueue,
  findPeerMatch,
} from "./db";
import { detectContent, detectBatch } from "./ai";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Incident Reporting - EchoReport
  incidents: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        platform: z.string().optional(),
        incidentType: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        evidenceUrls: z.string().optional(),
        contentHash: z.string().optional(),
        location: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const incident = await createIncident({
          userId: ctx.user.id,
          anonymousId: nanoid(),
          ...input,
        });
        return { success: true, id: Number(incident[0].insertId) };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getIncidentsByUserId(ctx.user.id);
    }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getIncidentById(input.id);
      }),
  }),

  // Trusted Contacts
  contacts: router({
    add: protectedProcedure
      .input(z.object({
        contactName: z.string(),
        contactEmail: z.string().email().optional(),
        contactPhone: z.string().optional(),
        relationship: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await addTrustedContact({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTrustedContacts(ctx.user.id);
    }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteTrustedContact(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Circles - Support Groups
  circles: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        maxMembers: z.number().default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createCircle({
          ownerId: ctx.user.id,
          isModerated: 1,
          encryptionKey: nanoid(32),
          ...input,
        });
        const circleId = Number(result[0].insertId);
        // Add creator as owner
        await addCircleMember({
          circleId,
          userId: ctx.user.id,
          role: "owner",
        });
        return { success: true, id: circleId };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserCircles(ctx.user.id);
    }),
    addMember: protectedProcedure
      .input(z.object({
        circleId: z.number(),
        userId: z.number(),
        role: z.enum(["member", "moderator", "owner"]).default("member"),
      }))
      .mutation(async ({ input }) => {
        await addCircleMember(input);
        return { success: true };
      }),
  }),

  // Chat Messages
  chat: router({
    send: protectedProcedure
      .input(z.object({
        circleId: z.number(),
        content: z.string(),
        isEncrypted: z.number().default(1),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createChatMessage({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    getMessages: protectedProcedure
      .input(z.object({
        circleId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        return getCircleMessages(input.circleId, input.limit);
      }),
  }),

  // Detection Logging
  detection: router({
    log: protectedProcedure
      .input(z.object({
        platform: z.string(),
        detectionType: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        content: z.string().optional(),
        aiModel: z.string().optional(),
        confidence: z.number().optional(),
        wasBlocked: z.number().default(0),
        userAction: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await logDetection({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    stats: protectedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return getUserDetectionStats(ctx.user.id, input.days);
      }),
  }),

  // Content Hashes - NCII
  hashes: router({
    create: protectedProcedure
      .input(z.object({
        hash: z.string(),
        hashType: z.string().default("pdq"),
        incidentId: z.number().optional(),
        platforms: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createContentHash({
          userId: ctx.user.id,
          status: "active",
          ...input,
        });
        return { success: true };
      }),
    check: publicProcedure
      .input(z.object({ hash: z.string() }))
      .query(async ({ input }) => {
        const result = await checkContentHash(input.hash);
        return { exists: !!result, data: result };
      }),
  }),

  // Takedown Requests
  takedown: router({
    create: protectedProcedure
      .input(z.object({
        incidentId: z.number().optional(),
        platform: z.string(),
        requestType: z.string().optional(),
        contentUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createTakedownRequest({
          userId: ctx.user.id,
          status: "pending",
          ...input,
        });
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getTakedownRequests(ctx.user.id);
    }),
  }),

  // Legal Cases
  legal: router({
    create: protectedProcedure
      .input(z.object({
        incidentId: z.number().optional(),
        country: z.string().optional(),
        caseType: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const caseNumber = `CASE-${Date.now()}-${nanoid(6)}`;
        await createLegalCase({
          userId: ctx.user.id,
          caseNumber,
          status: "draft",
          ...input,
        });
        return { success: true, caseNumber };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getLegalCases(ctx.user.id);
    }),
  }),

  // User Settings
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      if (!settings) {
        // Create default settings
        await upsertUserSettings({
          userId: ctx.user.id,
          sensitivity: "balanced",
          autoHide: 1,
          enableNotifications: 1,
          enableGPS: 0,
          enableHeartAnimations: 1,
          language: "en",
        });
        return getUserSettings(ctx.user.id);
      }
      return settings;
    }),
    update: protectedProcedure
      .input(z.object({
        sensitivity: z.enum(["low", "balanced", "high"]).optional(),
        autoHide: z.number().optional(),
        enableNotifications: z.number().optional(),
        enableGPS: z.number().optional(),
        enableHeartAnimations: z.number().optional(),
        language: z.string().optional(),
        country: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertUserSettings({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // Peer Matching
  peerMatch: router({
    join: protectedProcedure
      .input(z.object({
        supportType: z.string(),
        language: z.string().default("en"),
        country: z.string().optional(),
        interests: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Try to find a match first
        const match = await findPeerMatch(ctx.user.id, input.supportType, input.language);
        if (match) {
          // Update both users as matched
          return { success: true, matched: true, matchId: match.id, matchedUserId: match.userId };
        }
        // Add to queue
        await addToPeerMatchQueue({
          userId: ctx.user.id,
          status: "waiting",
          ...input,
        });
        return { success: true, matched: false };
      }),
  }),

  // AI Detection
  ai: router({
    detect: publicProcedure
      .input(z.object({
        content: z.string(),
      }))
      .mutation(async ({ input }) => {
        const result = await detectContent(input.content);
        return result;
      }),
    detectBatch: publicProcedure
      .input(z.object({
        contents: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const results = await detectBatch(input.contents);
        return results;
      }),
  }),
});

export type AppRouter = typeof appRouter;
