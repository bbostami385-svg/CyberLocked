import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { performSecurityScan } from "./scanner";
import { analyzeScanResultsWithAI } from "./aiAnalyzer";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============= SCAN TARGET OPERATIONS =============
  targets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getScanTargets(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          targetUrl: z.string().min(1, "Target URL/IP is required"),
          name: z.string().min(1),
          targetType: z.enum(["url", "ip", "domain"]),
          description: z.string().optional(),
          labels: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createScanTarget({
          createdByUserId: ctx.user.id,
          targetUrl: input.targetUrl,
          name: input.name,
          targetType: input.targetType,
          description: input.description,
          labels: input.labels || [],
          status: "active",
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getScanTargetById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          labels: z.array(z.string()).optional(),
          status: z.enum(["active", "inactive", "archived"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateScanTarget(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteScanTarget(input.id);
      }),
  }),

  // ============= SCAN OPERATIONS =============
  scans: router({
    list: protectedProcedure
      .input(z.object({ targetId: z.number() }))
      .query(async ({ input }) => {
        return await db.getScansByTargetId(input.targetId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const scan = await db.getScanById(input.id);
        if (!scan) throw new Error("Scan not found");
        return scan;
      }),

    start: protectedProcedure
      .input(
        z.object({
          targetId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get target
        const target = await db.getScanTargetById(input.targetId);
        if (!target) throw new Error("Target not found");

        // Create scan record - returns void, so we need to fetch it after
        await db.createScan({
          targetId: input.targetId,
          initiatedByUserId: ctx.user.id,
          status: "pending",
        });

        // Get the most recent scan for this target
        const scans = await db.getScansByTargetId(input.targetId, 1);
        const scan = scans[0];

        if (scan) {
          // Start async scanning in background
          performAsyncScan(scan.id, target.targetUrl, target.targetType as any);
        }

        return scan;
      }),

    recent: protectedProcedure.query(async () => {
      return await db.getRecentScans(1, 30);
    }),
  }),

  // ============= VULNERABILITY OPERATIONS =============
  vulnerabilities: router({
    list: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ input }) => {
        return await db.getVulnerabilitiesByScanId(input.scanId);
      }),

    markFalsePositive: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateVulnerability(input.id, { isFalsePositive: true });
      }),
  }),

  // ============= RECOMMENDATIONS OPERATIONS =============
  recommendations: router({
    list: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRecommendationsByScanId(input.scanId);
      }),

    markCompleted: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.updateRecommendation(input.id, { isCompleted: true });
      }),
  }),

  // ============= REPORT OPERATIONS =============
  reports: router({
    get: protectedProcedure
      .input(z.object({ scanId: z.number() }))
      .query(async ({ input }) => {
        return await db.getReportByScanId(input.scanId);
      }),

    download: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const report = await db.getReportById(input.id);
        if (!report) throw new Error("Report not found");
        return report;
      }),
  }),

  // ============= NOTIFICATION OPERATIONS =============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUserId(ctx.user.id);
    }),

    unread: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotifications(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.id);
      }),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      return await db.markAllNotificationsAsRead(ctx.user.id);
    }),
  }),

  // ============= SCHEDULED SCAN OPERATIONS =============
  scheduledScans: router({
    list: protectedProcedure
      .input(z.object({ targetId: z.number() }))
      .query(async ({ input }) => {
        return await db.getScheduledScansForTarget(input.targetId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          targetId: z.number(),
          frequencyHours: z.number().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const nextRunAt = new Date(Date.now() + input.frequencyHours * 60 * 60 * 1000);
        return await db.createScheduledScan({
          targetId: input.targetId,
          frequencyHours: input.frequencyHours,
          createdByUserId: ctx.user.id,
          nextRunAt,
          isActive: true,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteScheduledScan(input.id);
      }),
  }),

  // ============= DASHBOARD OPERATIONS =============
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const targets = await db.getScanTargets(ctx.user.id);
      const recentScans = await db.getRecentScans(ctx.user.id, 7);
      const criticalVulns = await db.getCriticalVulnerabilities(ctx.user.id);

      const completedScans = recentScans.filter((s) => s.status === "completed");
      const failedScans = recentScans.filter((s) => s.status === "failed");

      return {
        totalTargets: targets.length,
        activeTargets: targets.filter((t) => t.status === "active").length,
        recentScans: recentScans.length,
        completedScans: completedScans.length,
        failedScans: failedScans.length,
        criticalVulnerabilities: criticalVulns.length,
        averageRiskScore:
          recentScans.length > 0
            ? (
                recentScans.reduce((sum, s) => sum + (parseFloat(s.riskScore?.toString() || "0")), 0) /
                recentScans.length
              ).toFixed(2)
            : "0",
      };
    }),

    recentActivity: protectedProcedure.query(async ({ ctx }) => {
      const scans = await db.getRecentScans(ctx.user.id, 7);
      return scans.slice(0, 10).map((scan) => ({
        id: scan.id,
        type: "scan",
        targetId: scan.targetId,
        status: scan.status,
        severity: scan.overallSeverity,
        timestamp: scan.createdAt,
      }));
    }),
  }),
});

export type AppRouter = typeof appRouter;

/**
 * Perform async scanning and analysis
 */
async function performAsyncScan(
  scanId: number,
  targetUrl: string,
  targetType: "url" | "ip" | "domain"
) {
  try {
    // Update scan status to running
    await db.updateScan(scanId, { status: "running" });

    // Perform security scan
    const scanResult = await performSecurityScan({
      targetUrl,
      targetType,
    });

    // Analyze results with AI
    const aiAnalysis = await analyzeScanResultsWithAI(scanResult);

    // Store vulnerabilities
    for (const vuln of scanResult.vulnerabilities) {
      await db.createVulnerability({
        scanId,
        type: vuln.type,
        severity: vuln.severity,
        title: vuln.title,
        description: vuln.description,
        location: vuln.location,
        recommendation: vuln.recommendation,
        evidence: vuln.evidence,
        reference: vuln.reference,
      });
    }

    // Store recommendations
    for (const rec of aiAnalysis.recommendations) {
      await db.createSecurityRecommendation({
        scanId,
        priority: rec.priority,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        implementationSteps: rec.implementationSteps,
        effort: rec.effort,
      });
    }

    // Update scan with results
    await db.updateScan(scanId, {
      status: "completed",
      completedAt: new Date(),
      overallSeverity: scanResult.overallSeverity,
      vulnerabilityCount: scanResult.vulnerabilities.length,
      riskScore: scanResult.riskScore.toString(),
      scanData: scanResult as any,
      aiAnalysis: JSON.stringify(aiAnalysis),
    });

    // Create notification for scan completion
    const scan = await db.getScanById(scanId);
    if (scan) {
      const target = await db.getScanTargetById(scan.targetId);

      await db.createNotification({
        userId: scan.initiatedByUserId,
        scanId,
        type: "scan_completed",
        title: `Scan Completed: ${target?.name}`,
        message: `Security scan completed with ${scanResult.vulnerabilities.length} vulnerabilities found (Risk Score: ${scanResult.riskScore}/100)`,
      });

      // Notify if critical vulnerabilities found
      if (scanResult.overallSeverity === "critical") {
        await db.createNotification({
          userId: scan.initiatedByUserId,
          scanId,
          type: "critical_vulnerability",
          title: "Critical Vulnerability Detected",
          message: `Critical security issues found in ${target?.name}. Immediate action required.`,
        });
      }
    }

    // Notify owner
    await notifyOwner({
      title: "Security Scan Completed",
      content: `Scan completed for target. Found ${scanResult.vulnerabilities.length} vulnerabilities with risk score ${scanResult.riskScore}/100.`,
    });
  } catch (error) {
    console.error("Async scan error:", error);
    await db.updateScan(scanId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date(),
    });
  }
}
