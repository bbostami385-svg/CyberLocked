import { getDb } from "../db";

/**
 * Health check for deployment platforms
 */
export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  database: {
    status: "connected" | "disconnected";
    responseTime: number;
  };
  uptime: number;
  version: string;
}

export async function performHealthCheck(): Promise<HealthCheckResponse> {
  const startTime = Date.now();
  let dbStatus: "connected" | "disconnected" = "disconnected";
  let dbResponseTime = 0;

  try {
    const db = await getDb();
    if (db) {
      const dbStart = Date.now();
      // Simple query to check database connectivity
      await db.execute("SELECT 1");
      dbResponseTime = Date.now() - dbStart;
      dbStatus = "connected";
    }
  } catch (error) {
    console.error("[Health Check] Database connection failed:", error);
    dbStatus = "disconnected";
  }

  const uptime = process.uptime();
  const status = dbStatus === "connected" ? "healthy" : "degraded";

  return {
    status,
    timestamp: new Date(),
    database: {
      status: dbStatus,
      responseTime: dbResponseTime,
    },
    uptime,
    version: "1.0.0",
  };
}
