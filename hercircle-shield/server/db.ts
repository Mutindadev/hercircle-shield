import { and, desc, eq, gte, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  incidents,
  InsertIncident,
  trustedContacts,
  InsertTrustedContact,
  circles,
  InsertCircle,
  circleMembers,
  InsertCircleMember,
  chatMessages,
  InsertChatMessage,
  detectionLogs,
  InsertDetectionLog,
  contentHashes,
  InsertContentHash,
  takedownRequests,
  InsertTakedownRequest,
  legalCases,
  InsertLegalCase,
  userSettings,
  InsertUserSettings,
  peerMatchQueue,
  InsertPeerMatchQueue,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Incident Management
export async function createIncident(incident: InsertIncident) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(incidents).values(incident);
  return result;
}

export async function getIncidentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidents).where(eq(incidents.userId, userId)).orderBy(desc(incidents.createdAt));
}

export async function getIncidentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(incidents).where(eq(incidents.id, id)).limit(1);
  return result[0];
}

// Trusted Contacts
export async function addTrustedContact(contact: InsertTrustedContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(trustedContacts).values(contact);
}

export async function getTrustedContacts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trustedContacts).where(eq(trustedContacts.userId, userId));
}

export async function deleteTrustedContact(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(trustedContacts).where(and(eq(trustedContacts.id, id), eq(trustedContacts.userId, userId)));
}

// Circles
export async function createCircle(circle: InsertCircle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(circles).values(circle);
}

export async function getUserCircles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    circle: circles,
    membership: circleMembers,
  }).from(circleMembers)
    .innerJoin(circles, eq(circleMembers.circleId, circles.id))
    .where(eq(circleMembers.userId, userId));
}

export async function addCircleMember(member: InsertCircleMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(circleMembers).values(member);
}

// Chat Messages
export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values(message);
}

export async function getCircleMessages(circleId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    message: chatMessages,
    user: users,
  }).from(chatMessages)
    .innerJoin(users, eq(chatMessages.userId, users.id))
    .where(eq(chatMessages.circleId, circleId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

// Detection Logs
export async function logDetection(log: InsertDetectionLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(detectionLogs).values(log);
}

export async function getUserDetectionStats(userId: number, days = 7) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date();
  since.setDate(since.getDate() - days);
  return db.select().from(detectionLogs)
    .where(and(eq(detectionLogs.userId, userId), gte(detectionLogs.createdAt, since)));
}

// Content Hashes
export async function createContentHash(hash: InsertContentHash) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(contentHashes).values(hash);
}

export async function checkContentHash(hash: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contentHashes).where(eq(contentHashes.hash, hash)).limit(1);
  return result[0];
}

// Takedown Requests
export async function createTakedownRequest(request: InsertTakedownRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(takedownRequests).values(request);
}

export async function getTakedownRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(takedownRequests).where(eq(takedownRequests.userId, userId)).orderBy(desc(takedownRequests.createdAt));
}

// Legal Cases
export async function createLegalCase(legalCase: InsertLegalCase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(legalCases).values(legalCase);
}

export async function getLegalCases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(legalCases).where(eq(legalCases.userId, userId)).orderBy(desc(legalCases.createdAt));
}

// User Settings
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result[0];
}

export async function upsertUserSettings(settings: InsertUserSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(userSettings).values(settings).onDuplicateKeyUpdate({
    set: settings,
  });
}

// Peer Matching
export async function addToPeerMatchQueue(match: InsertPeerMatchQueue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(peerMatchQueue).values(match);
}

export async function findPeerMatch(userId: number, supportType: string, language: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(peerMatchQueue)
    .where(
      and(
        ne(peerMatchQueue.userId, userId),
        eq(peerMatchQueue.status, "waiting"),
        eq(peerMatchQueue.supportType, supportType),
        eq(peerMatchQueue.language, language)
      )
    )
    .limit(1);
  return result[0];
}
