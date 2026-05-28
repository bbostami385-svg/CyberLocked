import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["admin", "analyst"]).default("analyst").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scan targets table - stores websites, IPs, and domains to be scanned
 */
export const scanTargets = mysqlTable("scan_targets", {
  id: int("id").autoincrement().primaryKey(),
  /** Admin who created this target */
  createdByUserId: int("createdByUserId").notNull(),
  /** URL or IP address to scan */
  targetUrl: varchar("targetUrl", { length: 2048 }).notNull(),
  /** Display name for the target */
  name: varchar("name", { length: 255 }).notNull(),
  /** Type: url, ip, or domain */
  targetType: mysqlEnum("targetType", ["url", "ip", "domain"]).notNull(),
  /** Labels for organizing targets */
  labels: json("labels").$type<string[]>().default([]),
  /** Status: active, inactive, archived */
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active").notNull(),
  /** Description of the target */
  description: text("description"),
  /** Last scan timestamp */
  lastScannedAt: timestamp("lastScannedAt"),
  /** Is scheduled for automatic scanning */
  isScheduled: boolean("isScheduled").default(false),
  /** Scan frequency in hours (0 = manual only) */
  scanFrequencyHours: int("scanFrequencyHours").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScanTarget = typeof scanTargets.$inferSelect;
export type InsertScanTarget = typeof scanTargets.$inferInsert;

/**
 * Scans table - stores individual scan executions
 */
export const scans = mysqlTable("scans", {
  id: int("id").autoincrement().primaryKey(),
  /** Target being scanned */
  targetId: int("targetId").notNull(),
  /** User who initiated the scan */
  initiatedByUserId: int("initiatedByUserId").notNull(),
  /** Scan status: pending, running, completed, failed */
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).notNull(),
  /** Overall severity: critical, high, medium, low, info */
  overallSeverity: mysqlEnum("overallSeverity", ["critical", "high", "medium", "low", "info"]).default("info"),
  /** Total vulnerabilities found */
  vulnerabilityCount: int("vulnerabilityCount").default(0),
  /** Risk score 0-100 */
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }).default("0"),
  /** Raw scan data and results */
  scanData: json("scanData").$type<Record<string, unknown>>(),
  /** AI analysis results */
  aiAnalysis: text("aiAnalysis"),
  /** Scan start time */
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  /** Scan completion time */
  completedAt: timestamp("completedAt"),
  /** Error message if scan failed */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

/**
 * Vulnerabilities table - stores individual vulnerabilities found
 */
export const vulnerabilities = mysqlTable("vulnerabilities", {
  id: int("id").autoincrement().primaryKey(),
  /** Associated scan */
  scanId: int("scanId").notNull(),
  /** Vulnerability type: sql_injection, xss, open_port, outdated_software, etc */
  type: varchar("type", { length: 100 }).notNull(),
  /** Severity level */
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"]).notNull(),
  /** Vulnerability title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Detailed description */
  description: text("description"),
  /** Location/path where vulnerability was found */
  location: text("location"),
  /** Recommended fix */
  recommendation: text("recommendation"),
  /** Evidence/proof of vulnerability */
  evidence: text("evidence"),
  /** CWE or CVE reference */
  reference: varchar("reference", { length: 255 }),
  /** Is this a false positive */
  isFalsePositive: boolean("isFalsePositive").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = typeof vulnerabilities.$inferInsert;

/**
 * Security recommendations table - stores hardening recommendations
 */
export const securityRecommendations = mysqlTable("security_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  /** Associated scan */
  scanId: int("scanId").notNull(),
  /** Priority: critical, high, medium, low */
  priority: mysqlEnum("priority", ["critical", "high", "medium", "low"]).notNull(),
  /** Category: authentication, encryption, headers, dependencies, etc */
  category: varchar("category", { length: 100 }).notNull(),
  /** Recommendation title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Detailed recommendation */
  description: text("description"),
  /** Implementation steps */
  implementationSteps: json("implementationSteps").$type<string[]>(),
  /** Estimated effort: low, medium, high */
  effort: mysqlEnum("effort", ["low", "medium", "high"]).default("medium"),
  /** Is this recommendation completed */
  isCompleted: boolean("isCompleted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SecurityRecommendation = typeof securityRecommendations.$inferSelect;
export type InsertSecurityRecommendation = typeof securityRecommendations.$inferInsert;

/**
 * Reports table - stores generated PDF reports
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  /** Associated scan */
  scanId: int("scanId").notNull(),
  /** Report title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Report file storage key */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** Report file URL */
  fileUrl: text("fileUrl"),
  /** Report generation timestamp */
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  /** Report expiry (for cleanup) */
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Notifications table - stores notification history
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  /** User receiving notification */
  userId: int("userId").notNull(),
  /** Associated scan (optional) */
  scanId: int("scanId"),
  /** Notification type: scan_completed, critical_vulnerability, system_alert */
  type: mysqlEnum("type", ["scan_completed", "critical_vulnerability", "system_alert"]).notNull(),
  /** Notification title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Notification message */
  message: text("message"),
  /** Is read */
  isRead: boolean("isRead").default(false),
  /** Notification metadata */
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Scheduled scans table - tracks scheduled scan jobs
 */
export const scheduledScans = mysqlTable("scheduled_scans", {
  id: int("id").autoincrement().primaryKey(),
  /** Target to scan */
  targetId: int("targetId").notNull(),
  /** Frequency in hours */
  frequencyHours: int("frequencyHours").notNull(),
  /** Is active */
  isActive: boolean("isActive").default(true),
  /** Next scheduled run */
  nextRunAt: timestamp("nextRunAt"),
  /** Last run timestamp */
  lastRunAt: timestamp("lastRunAt"),
  /** Created by user */
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledScan = typeof scheduledScans.$inferSelect;
export type InsertScheduledScan = typeof scheduledScans.$inferInsert;
