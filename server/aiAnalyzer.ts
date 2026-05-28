/**
 * AI Security Analysis Engine
 * Uses LLM to analyze scan results and generate recommendations
 */

import { invokeLLM } from "./_core/llm";
import { ScanResult } from "./scanner";

export interface AIAnalysisResult {
  executiveSummary: string;
  riskAssessment: string;
  recommendations: SecurityRecommendation[];
  priorityActions: string[];
  detailedAnalysis: string;
}

export interface SecurityRecommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  implementationSteps: string[];
  effort: "low" | "medium" | "high";
  expectedImpact: string;
}

/**
 * Analyze scan results using AI
 */
export async function analyzeScanResultsWithAI(
  scanResult: ScanResult
): Promise<AIAnalysisResult> {
  const prompt = buildAnalysisPrompt(scanResult);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert cybersecurity analyst. Analyze the provided security scan results and provide:
1. Executive summary of the security posture
2. Risk assessment with specific concerns
3. Prioritized list of security recommendations
4. Top 3 priority actions
5. Detailed technical analysis

Format your response as JSON with the following structure:
{
  "executiveSummary": "string",
  "riskAssessment": "string",
  "recommendations": [
    {
      "priority": "critical|high|medium|low",
      "category": "string",
      "title": "string",
      "description": "string",
      "implementationSteps": ["string"],
      "effort": "low|medium|high",
      "expectedImpact": "string"
    }
  ],
  "priorityActions": ["string"],
  "detailedAnalysis": "string"
}`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "security_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              executiveSummary: { type: "string" },
              riskAssessment: { type: "string" },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    priority: {
                      type: "string",
                      enum: ["critical", "high", "medium", "low"],
                    },
                    category: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    implementationSteps: { type: "array", items: { type: "string" } },
                    effort: { type: "string", enum: ["low", "medium", "high"] },
                    expectedImpact: { type: "string" },
                  },
                  required: [
                    "priority",
                    "category",
                    "title",
                    "description",
                    "implementationSteps",
                    "effort",
                    "expectedImpact",
                  ],
                  additionalProperties: false,
                },
              },
              priorityActions: { type: "array", items: { type: "string" } },
              detailedAnalysis: { type: "string" },
            },
            required: [
              "executiveSummary",
              "riskAssessment",
              "recommendations",
              "priorityActions",
              "detailedAnalysis",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    // Handle both string and array content types
    let textContent = "";
    if (typeof content === "string") {
      textContent = content;
    } else if (Array.isArray(content)) {
      // Extract text from content array
      for (const item of content) {
        if (typeof item === "object" && "text" in item) {
          textContent = (item as any).text;
          break;
        }
      }
    }

    const analysis = JSON.parse(textContent) as AIAnalysisResult;
    return analysis;
  } catch (error) {
    console.error("AI analysis error:", error);
    // Fallback to template-based analysis if LLM fails
    return generateTemplateAnalysis(scanResult);
  }
}

/**
 * Build analysis prompt from scan results
 */
function buildAnalysisPrompt(scanResult: ScanResult): string {
  const vulnerabilityDetails = scanResult.vulnerabilities
    .map(
      (v) =>
        `- ${v.severity.toUpperCase()}: ${v.title} (${v.type})\n  Location: ${v.location}\n  Description: ${v.description}`
    )
    .join("\n");

  const threatDetails = scanResult.threatIndicators
    .map((t) => `- ${t.severity.toUpperCase()}: ${t.type}\n  ${t.description}`)
    .join("\n");

  const systemDetails = `
- Framework: ${scanResult.systemInfo.framework || "Unknown"}
- Open Ports: ${scanResult.systemInfo.openPorts.join(", ") || "None detected"}
- Dependencies: ${scanResult.systemInfo.dependencies.join(", ") || "None detected"}
- Risk Score: ${scanResult.riskScore}/100
- Overall Severity: ${scanResult.overallSeverity.toUpperCase()}
`;

  return `Analyze the following security scan results for ${scanResult.targetUrl}:

VULNERABILITIES FOUND:
${vulnerabilityDetails || "No vulnerabilities detected"}

THREAT INDICATORS:
${threatDetails || "No threats detected"}

SYSTEM INFORMATION:
${systemDetails}

Please provide a comprehensive security analysis with actionable recommendations.`;
}

/**
 * Generate template-based analysis (fallback)
 */
function generateTemplateAnalysis(scanResult: ScanResult): AIAnalysisResult {
  const criticalCount = scanResult.vulnerabilities.filter((v) => v.severity === "critical")
    .length;
  const highCount = scanResult.vulnerabilities.filter((v) => v.severity === "high").length;

  const recommendations: SecurityRecommendation[] = [];

  // Add recommendations based on vulnerabilities
  if (scanResult.vulnerabilities.some((v) => v.type === "sql_injection")) {
    recommendations.push({
      priority: "critical",
      category: "Database Security",
      title: "Eliminate SQL Injection Vulnerabilities",
      description:
        "SQL injection vulnerabilities allow attackers to manipulate database queries and access sensitive data.",
      implementationSteps: [
        "Use parameterized queries for all database operations",
        "Implement input validation and sanitization",
        "Use ORM frameworks that prevent SQL injection",
        "Apply principle of least privilege to database accounts",
      ],
      effort: "medium",
      expectedImpact: "Eliminates SQL injection attack vectors",
    });
  }

  if (scanResult.vulnerabilities.some((v) => v.type === "xss")) {
    recommendations.push({
      priority: "critical",
      category: "Application Security",
      title: "Prevent Cross-Site Scripting (XSS) Attacks",
      description:
        "XSS vulnerabilities allow attackers to inject malicious scripts that execute in users' browsers.",
      implementationSteps: [
        "Implement output encoding for all user-controlled data",
        "Use Content Security Policy (CSP) headers",
        "Validate and sanitize all user input",
        "Use security-focused templating engines",
      ],
      effort: "medium",
      expectedImpact: "Prevents XSS attack vectors",
    });
  }

  if (scanResult.vulnerabilities.some((v) => v.type === "missing_headers")) {
    recommendations.push({
      priority: "high",
      category: "HTTP Security",
      title: "Implement Security Headers",
      description:
        "Security headers provide browser-level protection against common attacks.",
      implementationSteps: [
        "Add Content-Security-Policy header",
        "Set X-Frame-Options: DENY",
        "Set X-Content-Type-Options: nosniff",
        "Enable Strict-Transport-Security",
        "Add X-XSS-Protection header",
      ],
      effort: "low",
      expectedImpact: "Provides defense-in-depth protection",
    });
  }

  if (scanResult.vulnerabilities.some((v) => v.type === "outdated_software")) {
    recommendations.push({
      priority: "high",
      category: "Dependency Management",
      title: "Update Outdated Dependencies",
      description:
        "Outdated libraries contain known vulnerabilities that can be exploited.",
      implementationSteps: [
        "Audit all dependencies for vulnerabilities",
        "Update to latest stable versions",
        "Implement automated dependency scanning",
        "Establish a patch management process",
      ],
      effort: "medium",
      expectedImpact: "Closes known vulnerability exploits",
    });
  }

  if (scanResult.vulnerabilities.some((v) => v.type === "weak_ssl")) {
    recommendations.push({
      priority: "critical",
      category: "Encryption",
      title: "Enable HTTPS with Strong TLS",
      description:
        "Unencrypted connections expose all data to interception and man-in-the-middle attacks.",
      implementationSteps: [
        "Obtain an SSL/TLS certificate",
        "Configure TLS 1.2 or higher",
        "Use strong cipher suites",
        "Implement HSTS headers",
        "Redirect all HTTP traffic to HTTPS",
      ],
      effort: "low",
      expectedImpact: "Encrypts all data in transit",
    });
  }

  if (scanResult.vulnerabilities.some((v) => v.type === "csrf")) {
    recommendations.push({
      priority: "high",
      category: "Session Security",
      title: "Implement CSRF Protection",
      description:
        "CSRF attacks trick users into performing unauthorized actions.",
      implementationSteps: [
        "Implement CSRF tokens on all state-changing requests",
        "Use SameSite cookie attribute",
        "Validate origin and referer headers",
        "Implement double-submit cookie pattern",
      ],
      effort: "medium",
      expectedImpact: "Prevents unauthorized state changes",
    });
  }

  const priorityActions = recommendations
    .filter((r) => r.priority === "critical")
    .slice(0, 3)
    .map((r) => `${r.title}: ${r.description}`);

  return {
    executiveSummary: `The security scan of ${scanResult.targetUrl} identified ${scanResult.vulnerabilities.length} vulnerabilities with an overall risk score of ${scanResult.riskScore}/100. The system has ${criticalCount} critical and ${highCount} high-severity issues that require immediate attention.`,
    riskAssessment: `The target exhibits ${scanResult.overallSeverity.toUpperCase()} risk level. Critical vulnerabilities include SQL injection, XSS, and missing encryption. These issues could allow attackers to compromise data, inject malicious code, or intercept communications.`,
    recommendations,
    priorityActions,
    detailedAnalysis: `The security posture shows significant vulnerabilities in input validation, encryption, and security headers. The presence of ${criticalCount} critical issues indicates that the application requires urgent security hardening before production deployment.`,
  };
}

/**
 * Generate plain-language explanation of vulnerability
 */
export function explainVulnerability(
  type: string,
  severity: string,
  location: string
): string {
  const explanations: Record<string, string> = {
    sql_injection: `This SQL injection vulnerability allows attackers to manipulate database queries by injecting malicious SQL code through user input. An attacker could extract sensitive data, modify records, or even delete entire databases.`,
    xss: `This Cross-Site Scripting vulnerability allows attackers to inject malicious JavaScript code that executes in users' browsers. This can lead to session hijacking, credential theft, or malware distribution.`,
    csrf: `This CSRF vulnerability allows attackers to trick authenticated users into performing unauthorized actions. An attacker could change passwords, transfer funds, or modify settings without the user's knowledge.`,
    weak_ssl: `This unencrypted connection vulnerability means all data transmitted between the client and server is visible to attackers. This includes login credentials, personal information, and sensitive business data.`,
    missing_headers: `Missing security headers leave the application vulnerable to various attacks. These headers provide browser-level protection against clickjacking, content-type sniffing, and other attacks.`,
    outdated_software: `Using outdated software components exposes the application to known vulnerabilities that attackers actively exploit. These vulnerabilities have public exploits available.`,
    default_credentials: `Default credentials are commonly known and can be easily guessed or found online. Attackers often use automated tools to scan for systems using default credentials.`,
    open_ports: `Unnecessary open ports increase the attack surface. Each open port is a potential entry point for attackers to exploit services running on that port.`,
  };

  return (
    explanations[type] ||
    `This ${severity} severity vulnerability could compromise the security of the application and its users.`
  );
}
