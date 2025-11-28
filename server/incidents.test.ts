import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Incidents API", () => {
  it("should create an incident report", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.incidents.create({
      title: "Test Harassment Incident",
      description: "This is a test incident report",
      platform: "Twitter",
      incidentType: "harassment",
      severity: "medium",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it("should list user incidents", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create an incident first
    await caller.incidents.create({
      title: "Test Incident",
      description: "Test description",
      platform: "Facebook",
      incidentType: "harassment",
    });

    const incidents = await caller.incidents.list();
    expect(Array.isArray(incidents)).toBe(true);
  });
});

describe("Trusted Contacts API", () => {
  it("should add a trusted contact", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.add({
      contactName: "Jane Doe",
      contactEmail: "jane@example.com",
      contactPhone: "+254700000000",
      relationship: "Friend",
    });

    expect(result.success).toBe(true);
  });

  it("should list trusted contacts", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const contacts = await caller.contacts.list();
    expect(Array.isArray(contacts)).toBe(true);
  });
});

describe("Settings API", () => {
  it("should get user settings", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.settings.get();
    expect(settings).toBeDefined();
  });

  it("should update user settings", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.settings.update({
      sensitivity: "high",
      autoHide: 1,
      enableNotifications: 1,
    });

    expect(result.success).toBe(true);
  });
});

describe("Detection Logging API", () => {
  it("should log a detection event", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.detection.log({
      platform: "Twitter",
      detectionType: "harassment",
      severity: "high",
      content: "Test harmful content",
      aiModel: "gemini",
      confidence: 85,
      wasBlocked: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should retrieve detection stats", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.detection.stats({ days: 7 });
    expect(Array.isArray(stats)).toBe(true);
  });
});
