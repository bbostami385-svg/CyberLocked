import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  scanTargets,
  scans,
  vulnerabilities,
  securityRecommendations,
  reports,
  notifications,
  scheduledScans,
  ScanTarget,
  Scan,
  Vulnerability,
  SecurityRecommendation,
  Report,
  Notification,
  ScheduledScan,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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

// ============= USER OPERATIONS =============

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
      values.role = "admin";
      updateSet.role = "admin";
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= SCAN TARGET OPERATIONS =============

export async function createScanTarget(
  data: Omit<typeof scanTargets.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scanTargets).values(data);
  return result[0];
}

export async function getScanTargets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scanTargets)
    .where(eq(scanTargets.createdByUserId, userId));
}

export async function getScanTargetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(scanTargets)
    .where(eq(scanTargets.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateScanTarget(
  id: number,
  data: Partial<typeof scanTargets.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(scanTargets).set(data).where(eq(scanTargets.id, id));
}

export async function deleteScanTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(scanTargets).where(eq(scanTargets.id, id));
}

// ============= SCAN OPERATIONS =============

export async function createScan(
  data: Omit<typeof scans.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scans).values(data);
  return result[0];
}

export async function getScanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(scans).where(eq(scans.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getScansByTargetId(targetId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scans)
    .where(eq(scans.targetId, targetId))
    .orderBy(desc(scans.createdAt))
    .limit(limit);
}

export async function updateScan(
  id: number,
  data: Partial<typeof scans.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(scans).set(data).where(eq(scans.id, id));
}

// ============= VULNERABILITY OPERATIONS =============

export async function createVulnerability(
  data: Omit<typeof vulnerabilities.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(vulnerabilities).values(data);
}

export async function getVulnerabilitiesByScanId(scanId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.scanId, scanId))
    .orderBy(desc(vulnerabilities.severity));
}

export async function updateVulnerability(
  id: number,
  data: Partial<typeof vulnerabilities.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(vulnerabilities)
    .set(data)
    .where(eq(vulnerabilities.id, id));
}

// ============= SECURITY RECOMMENDATION OPERATIONS =============

export async function createSecurityRecommendation(
  data: Omit<typeof securityRecommendations.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(securityRecommendations).values(data);
}

export async function getRecommendationsByScanId(scanId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(securityRecommendations)
    .where(eq(securityRecommendations.scanId, scanId))
    .orderBy(desc(securityRecommendations.priority));
}

export async function updateRecommendation(
  id: number,
  data: Partial<typeof securityRecommendations.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(securityRecommendations)
    .set(data)
    .where(eq(securityRecommendations.id, id));
}

// ============= REPORT OPERATIONS =============

export async function createReport(
  data: Omit<typeof reports.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(reports).values(data);
}

export async function getReportByScanId(scanId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(reports)
    .where(eq(reports.scanId, scanId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= NOTIFICATION OPERATIONS =============

export async function createNotification(
  data: Omit<typeof notifications.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notifications).values(data);
}

export async function getNotificationsByUserId(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

// ============= SCHEDULED SCAN OPERATIONS =============

export async function createScheduledScan(
  data: Omit<typeof scheduledScans.$inferInsert, "id" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scheduledScans).values(data);
}

export async function getScheduledScansForTarget(targetId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scheduledScans)
    .where(and(eq(scheduledScans.targetId, targetId), eq(scheduledScans.isActive, true)));
}

export async function getActiveScheduledScans() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scheduledScans)
    .where(eq(scheduledScans.isActive, true));
}

export async function updateScheduledScan(
  id: number,
  data: Partial<typeof scheduledScans.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(scheduledScans)
    .set(data)
    .where(eq(scheduledScans.id, id));
}

export async function deleteScheduledScan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(scheduledScans).where(eq(scheduledScans.id, id));
}

// ============= ANALYTICS OPERATIONS =============

export async function getRecentScans(userId: number, days = 30) {
  const db = await getDb();
  if (!db) return [];

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return await db
    .select()
    .from(scans)
    .where(gte(scans.createdAt, since))
    .orderBy(desc(scans.createdAt))
    .limit(100);
}

export async function getCriticalVulnerabilities(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(vulnerabilities)
    .where(eq(vulnerabilities.severity, "critical"))
    .orderBy(desc(vulnerabilities.createdAt))
    .limit(50);
}
