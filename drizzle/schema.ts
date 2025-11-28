import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Incident Reports - EchoReport feature
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  anonymousId: varchar("anonymousId", { length: 64 }),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  platform: varchar("platform", { length: 64 }),
  incidentType: varchar("incidentType", { length: 64 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "escalated"]).default("pending"),
  evidenceUrls: text("evidenceUrls"),
  contentHash: varchar("contentHash", { length: 128 }),
  location: varchar("location", { length: 255 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// Trusted Contacts - HerCircle feature
export const trustedContacts = mysqlTable("trustedContacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 32 }),
  relationship: varchar("relationship", { length: 64 }),
  isVerified: int("isVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrustedContact = typeof trustedContacts.$inferSelect;
export type InsertTrustedContact = typeof trustedContacts.$inferInsert;

// Circles - Group support feature
export const circles = mysqlTable("circles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: int("ownerId").notNull().references(() => users.id),
  isModerated: int("isModerated").default(1).notNull(),
  maxMembers: int("maxMembers").default(5),
  encryptionKey: varchar("encryptionKey", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Circle = typeof circles.$inferSelect;
export type InsertCircle = typeof circles.$inferInsert;

// Circle Members
export const circleMembers = mysqlTable("circleMembers", {
  id: int("id").autoincrement().primaryKey(),
  circleId: int("circleId").notNull().references(() => circles.id),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["member", "moderator", "owner"]).default("member"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type CircleMember = typeof circleMembers.$inferSelect;
export type InsertCircleMember = typeof circleMembers.$inferInsert;

// Chat Messages
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  circleId: int("circleId").notNull().references(() => circles.id),
  userId: int("userId").notNull().references(() => users.id),
  content: text("content").notNull(),
  isEncrypted: int("isEncrypted").default(1).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Detection Logs
export const detectionLogs = mysqlTable("detectionLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  platform: varchar("platform", { length: 64 }).notNull(),
  detectionType: varchar("detectionType", { length: 64 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  content: text("content"),
  aiModel: varchar("aiModel", { length: 64 }),
  confidence: int("confidence"),
  wasBlocked: int("wasBlocked").default(0),
  userAction: varchar("userAction", { length: 64 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DetectionLog = typeof detectionLogs.$inferSelect;
export type InsertDetectionLog = typeof detectionLogs.$inferInsert;

// Content Hashes - NCII tracking
export const contentHashes = mysqlTable("contentHashes", {
  id: int("id").autoincrement().primaryKey(),
  hash: varchar("hash", { length: 128 }).notNull().unique(),
  hashType: varchar("hashType", { length: 32 }).default("pdq"),
  incidentId: int("incidentId").references(() => incidents.id),
  userId: int("userId").references(() => users.id),
  status: mysqlEnum("status", ["active", "removed", "pending"]).default("active"),
  platforms: text("platforms"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentHash = typeof contentHashes.$inferSelect;
export type InsertContentHash = typeof contentHashes.$inferInsert;

// Takedown Requests
export const takedownRequests = mysqlTable("takedownRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  incidentId: int("incidentId").references(() => incidents.id),
  platform: varchar("platform", { length: 64 }).notNull(),
  requestType: varchar("requestType", { length: 64 }),
  contentUrl: text("contentUrl"),
  status: mysqlEnum("status", ["pending", "submitted", "approved", "rejected"]).default("pending"),
  responseData: text("responseData"),
  submittedAt: timestamp("submittedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TakedownRequest = typeof takedownRequests.$inferSelect;
export type InsertTakedownRequest = typeof takedownRequests.$inferInsert;

// Legal Cases
export const legalCases = mysqlTable("legalCases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  incidentId: int("incidentId").references(() => incidents.id),
  caseNumber: varchar("caseNumber", { length: 64 }),
  country: varchar("country", { length: 64 }),
  caseType: varchar("caseType", { length: 64 }),
  status: mysqlEnum("status", ["draft", "filed", "in_progress", "resolved"]).default("draft"),
  documents: text("documents"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LegalCase = typeof legalCases.$inferSelect;
export type InsertLegalCase = typeof legalCases.$inferInsert;

// User Settings
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id).unique(),
  sensitivity: mysqlEnum("sensitivity", ["low", "balanced", "high"]).default("balanced"),
  autoHide: int("autoHide").default(1).notNull(),
  enableNotifications: int("enableNotifications").default(1).notNull(),
  enableGPS: int("enableGPS").default(0).notNull(),
  enableHeartAnimations: int("enableHeartAnimations").default(1).notNull(),
  language: varchar("language", { length: 8 }).default("en"),
  country: varchar("country", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

// Peer Matching Queue
export const peerMatchQueue = mysqlTable("peerMatchQueue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  interests: text("interests"),
  supportType: varchar("supportType", { length: 64 }),
  language: varchar("language", { length: 8 }),
  country: varchar("country", { length: 64 }),
  status: mysqlEnum("status", ["waiting", "matched", "cancelled"]).default("waiting"),
  matchedWith: int("matchedWith").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  matchedAt: timestamp("matchedAt"),
});

export type PeerMatchQueue = typeof peerMatchQueue.$inferSelect;
export type InsertPeerMatchQueue = typeof peerMatchQueue.$inferInsert;