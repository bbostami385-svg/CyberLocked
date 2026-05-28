/**
 * Security Report Generator
 * Generates comprehensive PDF reports from scan results
 */

import { Scan, Vulnerability, SecurityRecommendation } from "../drizzle/schema";
import * as db from "./db";

export interface ReportData {
  scan: Scan;
  target: any;
  vulnerabilities: Vulnerability[];
  recommendations: SecurityRecommendation[];
  aiAnalysis: any;
}

/**
 * Generate HTML report from scan data
 */
export async function generateHTMLReport(scanId: number): Promise<string> {
  const scan = await db.getScanById(scanId);
  if (!scan) throw new Error("Scan not found");

  const target = await db.getScanTargetById(scan.targetId);
  const vulnerabilities = await db.getVulnerabilitiesByScanId(scanId);
  const recommendations = await db.getRecommendationsByScanId(scanId);

  let aiAnalysis = null;
  if (scan.aiAnalysis) {
    try {
      aiAnalysis = JSON.parse(scan.aiAnalysis);
    } catch (e) {
      console.error("Failed to parse AI analysis:", e);
    }
  }

  const reportData: ReportData = {
    scan,
    target,
    vulnerabilities,
    recommendations,
    aiAnalysis,
  };

  return buildHTMLReport(reportData);
}

/**
 * Build comprehensive HTML report
 */
function buildHTMLReport(data: ReportData): string {
  const { scan, target, vulnerabilities, recommendations, aiAnalysis } = data;

  const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
  const highCount = vulnerabilities.filter((v) => v.severity === "high").length;
  const mediumCount = vulnerabilities.filter((v) => v.severity === "medium").length;
  const lowCount = vulnerabilities.filter((v) => v.severity === "low").length;

  const severityColors: Record<string, string> = {
    critical: "#dc2626",
    high: "#ea580c",
    medium: "#f59e0b",
    low: "#3b82f6",
    info: "#6b7280",
  };

  const severityBgColors: Record<string, string> = {
    critical: "#fee2e2",
    high: "#fed7aa",
    medium: "#fef3c7",
    low: "#dbeafe",
    info: "#f3f4f6",
  };

  const vulnerabilityRows = vulnerabilities
    .map(
      (v) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: left;">
        <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: ${severityBgColors[v.severity]}; color: ${severityColors[v.severity]}; font-weight: 600; font-size: 12px;">
          ${v.severity.toUpperCase()}
        </span>
      </td>
      <td style="padding: 12px; text-align: left; font-weight: 600;">${v.title}</td>
      <td style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px;">${v.type}</td>
      <td style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px;">${v.location}</td>
    </tr>
  `
    )
    .join("");

  const recommendationRows = recommendations
    .map(
      (r) => `
    <div style="margin-bottom: 20px; padding: 16px; border-left: 4px solid ${severityColors[r.priority]}; background-color: ${severityBgColors[r.priority]}; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <h4 style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 600;">${r.title}</h4>
        <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background-color: white; color: ${severityColors[r.priority]}; font-weight: 600; font-size: 12px;">
          ${r.priority.toUpperCase()} - ${(r.effort || 'medium').toUpperCase()} EFFORT
        </span>
      </div>
      <p style="margin: 8px 0; color: #4b5563; font-size: 14px;">${r.description}</p>
      <div style="margin-top: 12px;">
        <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600; font-size: 13px;">Implementation Steps:</p>
        <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
          ${r.implementationSteps?.map((step: string) => `<li style="margin-bottom: 4px;">${step}</li>`).join("") || ""}
        </ol>
      </div>
    </div>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Scan Report - ${target?.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background-color: #f9fafb;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: white;
    }
    .header {
      border-bottom: 3px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .executive-summary {
      background-color: #f0f9ff;
      border-left: 4px solid #0284c7;
      padding: 16px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .executive-summary h2 {
      font-size: 16px;
      font-weight: 600;
      color: #0c4a6e;
      margin-bottom: 8px;
    }
    .executive-summary p {
      color: #0c4a6e;
      font-size: 14px;
      line-height: 1.6;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 30px;
    }
    .stat-card {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #f9fafb;
    }
    .stat-card h3 {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
    }
    .risk-score {
      font-size: 24px;
      font-weight: 700;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 30px;
    }
    .risk-score.critical {
      background-color: #fee2e2;
      color: #dc2626;
    }
    .risk-score.high {
      background-color: #fed7aa;
      color: #ea580c;
    }
    .risk-score.medium {
      background-color: #fef3c7;
      color: #f59e0b;
    }
    .risk-score.low {
      background-color: #dbeafe;
      color: #3b82f6;
    }
    section {
      margin-bottom: 40px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    thead {
      background-color: #f3f4f6;
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #1f2937;
      font-size: 13px;
      text-transform: uppercase;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      text-align: left;
      font-size: 14px;
      color: #4b5563;
    }
    .priority-actions {
      background-color: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 16px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .priority-actions h3 {
      color: #991b1b;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .priority-actions ol {
      margin-left: 20px;
      color: #7f1d1d;
      font-size: 14px;
    }
    .priority-actions li {
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      text-align: center;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Security Scan Report</h1>
      <p>Target: <strong>${target?.name || "Unknown"}</strong> | URL: <strong>${target?.targetUrl || "N/A"}</strong></p>
      <p>Scan Date: <strong>${new Date(scan.createdAt).toLocaleString()}</strong> | Report Generated: <strong>${new Date().toLocaleString()}</strong></p>
    </div>

    <!-- Risk Score -->
    <div class="risk-score ${scan.overallSeverity || 'info'}">
      Risk Score: ${scan.riskScore}/100 (${(scan.overallSeverity || 'info').toUpperCase()})
    </div>

    <!-- Executive Summary -->
    ${
      aiAnalysis
        ? `
    <div class="executive-summary">
      <h2>Executive Summary</h2>
      <p>${aiAnalysis.executiveSummary || "Security scan completed with analysis."}</p>
    </div>
    `
        : ""
    }

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Vulnerabilities</h3>
        <div class="value">${vulnerabilities.length}</div>
      </div>
      <div class="stat-card">
        <h3>Critical</h3>
        <div class="value" style="color: #dc2626;">${criticalCount}</div>
      </div>
      <div class="stat-card">
        <h3>High</h3>
        <div class="value" style="color: #ea580c;">${highCount}</div>
      </div>
      <div class="stat-card">
        <h3>Medium</h3>
        <div class="value" style="color: #f59e0b;">${mediumCount}</div>
      </div>
      <div class="stat-card">
        <h3>Low</h3>
        <div class="value" style="color: #3b82f6;">${lowCount}</div>
      </div>
    </div>

    <!-- Priority Actions -->
    ${
      aiAnalysis?.priorityActions && aiAnalysis.priorityActions.length > 0
        ? `
    <div class="priority-actions">
      <h3>⚠️ Priority Actions Required</h3>
      <ol>
        ${aiAnalysis.priorityActions.map((action: string) => `<li>${action}</li>`).join("")}
      </ol>
    </div>
    `
        : ""
    }

    <!-- Vulnerabilities -->
    <section>
      <h2>Vulnerabilities Found</h2>
      ${
        vulnerabilities.length > 0
          ? `
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Title</th>
            <th>Type</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          ${vulnerabilityRows}
        </tbody>
      </table>
      `
          : "<p style='color: #6b7280;'>No vulnerabilities detected.</p>"
      }
    </section>

    <!-- Detailed Vulnerability Analysis -->
    ${
      vulnerabilities.length > 0
        ? `
    <section>
      <h2>Detailed Vulnerability Analysis</h2>
      ${vulnerabilities
        .map(
          (v) => `
      <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 8px;">${v.title}</h3>
        <p style="margin: 8px 0; color: #6b7280; font-size: 13px;">
          <strong>Type:</strong> ${v.type} | <strong>Location:</strong> ${v.location}
        </p>
        <p style="margin: 8px 0; color: #4b5563; font-size: 14px;"><strong>Description:</strong> ${v.description}</p>
        <p style="margin: 8px 0; color: #4b5563; font-size: 14px;"><strong>Recommendation:</strong> ${v.recommendation}</p>
        ${v.evidence ? `<p style="margin: 8px 0; color: #4b5563; font-size: 14px;"><strong>Evidence:</strong> ${v.evidence}</p>` : ""}
      </div>
      `
        )
        .join("")}
    </section>
    `
        : ""
    }

    <!-- Security Recommendations -->
    ${
      recommendations.length > 0
        ? `
    <section>
      <h2>Security Hardening Recommendations</h2>
      ${recommendationRows}
    </section>
    `
        : ""
    }

    <!-- Risk Assessment -->
    ${
      aiAnalysis
        ? `
    <section>
      <h2>Risk Assessment</h2>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.8;">${aiAnalysis.riskAssessment || "Assessment pending."}</p>
    </section>
    `
        : ""
    }

    <!-- Footer -->
    <div class="footer">
      <p>CyberLocked Security Platform | Confidential Report</p>
      <p>Generated on ${new Date().toLocaleString()} | Report ID: ${scan.id}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generate plain text summary
 */
export function generateTextSummary(data: ReportData): string {
  const { scan, target, vulnerabilities, recommendations } = data;

  const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length;
  const highCount = vulnerabilities.filter((v) => v.severity === "high").length;

  return `
SECURITY SCAN REPORT
====================
Target: ${target?.name}
URL: ${target?.targetUrl}
Scan Date: ${new Date(scan.createdAt).toLocaleString()}

SUMMARY
-------
Risk Score: ${scan.riskScore}/100 (${(scan.overallSeverity || 'info').toUpperCase()})
Total Vulnerabilities: ${vulnerabilities.length}
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${vulnerabilities.filter((v) => v.severity === "medium").length}
- Low: ${vulnerabilities.filter((v) => v.severity === "low").length}

TOP VULNERABILITIES
-------------------
${vulnerabilities
  .slice(0, 5)
  .map((v) => `- [${v.severity.toUpperCase()}] ${v.title} (${v.type})`)
  .join("\n")}

RECOMMENDATIONS
---------------
${recommendations
  .slice(0, 5)
  .map((r) => `- [${r.priority.toUpperCase()}] ${r.title}`)
  .join("\n")}

For full details, see the complete HTML report.
  `;
}
