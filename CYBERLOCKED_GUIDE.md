# CyberLocked - Enterprise Security Scanning Platform

## Overview

**CyberLocked** is a professional-grade security scanning and vulnerability management platform designed for teams to identify, analyze, and remediate security threats across websites, web applications, and network infrastructure.

### Key Capabilities

- **Vulnerability Scanning**: Detect SQL injection, XSS, weak SSL, open ports, and 100+ vulnerability types
- **AI-Powered Analysis**: Intelligent threat assessment with actionable remediation recommendations
- **Real-Time Monitoring**: Continuous security monitoring with instant notifications
- **Professional Reports**: Comprehensive PDF reports with risk scores and implementation guides
- **Team Collaboration**: Role-based access control for admin and analyst teams
- **Automated Scanning**: Schedule recurring scans for continuous security posture assessment

---

## Getting Started

### Prerequisites

- Node.js 22.x
- MySQL/TiDB database
- Manus OAuth credentials (automatically configured)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd cyber-locked-platform
   pnpm install
   ```

2. **Database Setup**
   - Database tables are automatically created during deployment
   - Schema includes: users, scan_targets, scans, vulnerabilities, recommendations, reports, notifications

3. **Environment Configuration**
   - All required environment variables are automatically injected by Manus
   - No manual `.env` file configuration needed

4. **Start Development Server**
   ```bash
   pnpm dev
   ```
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/trpc

---

## User Roles & Permissions

### Admin Role
- Full platform access
- Create and manage scan targets
- Initiate security scans
- View all reports and vulnerabilities
- Manage team members
- Configure scheduled scans
- Access all notifications

### Analyst Role
- View assigned scan targets
- View scan results and reports
- Mark vulnerabilities as false positives
- Track remediation progress
- Receive notifications on critical findings

---

## Core Features

### 1. Target Management

**Add a Scan Target:**
- Navigate to **Targets** section
- Click **Add Target**
- Enter target details:
  - **Name**: Descriptive name for the target
  - **Target URL/IP**: Website URL, IP address, or domain
  - **Type**: Select URL, IP, or Domain
  - **Description**: Optional notes about the target
  - **Labels**: Organize targets with custom tags

**Supported Target Types:**
- URLs: `https://example.com`, `http://api.example.com`
- IP Addresses: `192.168.1.100`, `10.0.0.50`
- Domains: `example.com`, `subdomain.example.com`

### 2. Security Scanning

**Initiate a Scan:**
1. Go to **Targets** → Select target
2. Click **Start Scan** button
3. Scan status updates in real-time:
   - **Pending**: Queued for execution
   - **Running**: Active scanning in progress
   - **Completed**: Results available
   - **Failed**: Check error message

**Scan Results Include:**
- Vulnerability count by severity
- Overall risk score (0-100)
- Detected vulnerability details
- AI-generated recommendations
- Evidence and remediation steps

### 3. Vulnerability Analysis

**View Vulnerabilities:**
- Click on completed scan → **Vulnerabilities** tab
- Filter by severity: Critical, High, Medium, Low, Info
- Each vulnerability shows:
  - **Title**: Vulnerability name
  - **Severity**: Risk level
  - **Description**: Technical details
  - **Location**: Where vulnerability was found
  - **Recommendation**: How to fix it
  - **Evidence**: Proof of vulnerability

**Mark False Positives:**
- Click vulnerability → **Mark as False Positive**
- Helps improve scan accuracy over time

### 4. Security Recommendations

**AI-Generated Recommendations:**
- Automatically generated after each scan
- Prioritized by severity and effort
- Includes implementation steps
- Effort estimates: Low, Medium, High

**Track Progress:**
- Mark recommendations as completed
- Monitor remediation status
- Reference implementation guides

### 5. Report Generation

**Download Reports:**
1. Navigate to **Reports** section
2. Select completed scan
3. Click **Download PDF Report**

**Report Contents:**
- Executive summary
- Risk score and severity breakdown
- Detailed vulnerability list
- AI analysis and insights
- Prioritized recommendations
- Implementation roadmap

### 6. Scheduled Scanning

**Set Up Recurring Scans:**
1. Go to **Targets** → Select target
2. Click **Schedule Scan**
3. Set frequency (hourly, daily, weekly)
4. Scans run automatically at scheduled times

**Automatic Notifications:**
- Receive alerts when scans complete
- Critical vulnerabilities trigger immediate notifications
- View scan history and trends

### 7. Real-Time Notifications

**Notification Types:**
- **Scan Completed**: When a security scan finishes
- **Critical Vulnerability**: When critical issues are found
- **System Alerts**: Important platform events

**Manage Notifications:**
- View all notifications in **Notifications** section
- Mark as read/unread
- Track notification history

---

## Dashboard

The **Dashboard** provides at-a-glance security insights:

- **Total Targets**: Number of registered scan targets
- **Active Targets**: Currently monitored systems
- **Recent Scans**: Latest scanning activity
- **Critical Vulnerabilities**: High-severity findings
- **Risk Score**: Average security posture
- **Activity Timeline**: Recent events and changes

---

## API Reference

### Authentication

All API requests require valid user authentication via Manus OAuth.

```typescript
// Get current user
const user = await trpc.auth.me.useQuery();

// Logout
const logout = await trpc.auth.logout.useMutation();
```

### Target Operations

```typescript
// List all targets
const targets = await trpc.targets.list.useQuery();

// Create target
const target = await trpc.targets.create.useMutation({
  name: "My Website",
  targetUrl: "https://example.com",
  targetType: "url",
  description: "Production website"
});

// Get target details
const target = await trpc.targets.get.useQuery({ id: 1 });

// Update target
await trpc.targets.update.useMutation({
  id: 1,
  name: "Updated Name",
  status: "active"
});

// Delete target
await trpc.targets.delete.useMutation({ id: 1 });
```

### Scan Operations

```typescript
// Start scan
const scan = await trpc.scans.start.useMutation({ targetId: 1 });

// Get scan details
const scan = await trpc.scans.get.useQuery({ id: scanId });

// List scans for target
const scans = await trpc.scans.list.useQuery({ targetId: 1 });

// Get recent scans
const recentScans = await trpc.scans.recent.useQuery();
```

### Vulnerability Operations

```typescript
// List vulnerabilities for scan
const vulns = await trpc.vulnerabilities.list.useQuery({ scanId: 1 });

// Mark as false positive
await trpc.vulnerabilities.markFalsePositive.useMutation({ id: vulnId });
```

### Recommendations

```typescript
// List recommendations for scan
const recs = await trpc.recommendations.list.useQuery({ scanId: 1 });

// Mark recommendation as completed
await trpc.recommendations.markCompleted.useMutation({ id: recId });
```

### Notifications

```typescript
// List user notifications
const notifications = await trpc.notifications.list.useQuery();

// Get unread notifications
const unread = await trpc.notifications.unread.useQuery();

// Mark as read
await trpc.notifications.markAsRead.useMutation({ id: notifId });

// Mark all as read
await trpc.notifications.markAllAsRead.useMutation();
```

### Dashboard

```typescript
// Get dashboard statistics
const stats = await trpc.dashboard.stats.useQuery();

// Get recent activity
const activity = await trpc.dashboard.recentActivity.useQuery();
```

---

## Security Best Practices

### For Administrators

1. **Regular Audits**: Run scans on all critical systems weekly
2. **Team Access**: Assign analyst role to team members who need read-only access
3. **Notification Setup**: Enable critical vulnerability alerts
4. **Report Review**: Review and act on AI recommendations promptly
5. **Scheduled Scans**: Set up automated scanning for continuous monitoring

### For Analysts

1. **Verify Findings**: Validate scan results before reporting
2. **False Positives**: Mark false positives to improve accuracy
3. **Documentation**: Document remediation steps taken
4. **Communication**: Coordinate with development teams on fixes
5. **Follow-up**: Track remediation progress and completion

### General Security

- Keep scan targets updated with current URLs/IPs
- Review and act on critical vulnerabilities immediately
- Use descriptive labels to organize targets by environment (prod, staging, dev)
- Archive inactive targets to keep dashboard clean
- Maintain audit trail of all scans and changes

---

## Troubleshooting

### Scan Fails to Start
- Verify target URL/IP is accessible
- Check network connectivity
- Ensure target is not blocked by firewall
- Review error message in scan details

### Missing Vulnerabilities
- Some vulnerabilities require specific conditions
- Run multiple scans to gather comprehensive data
- Check if target is actively responding
- Verify target type is correctly set

### Report Generation Issues
- Ensure scan has completed successfully
- Check available disk space
- Verify PDF generation service is running
- Try downloading again after a few moments

### Notifications Not Received
- Check notification preferences
- Verify user email is configured
- Ensure critical vulnerability threshold is set appropriately
- Check system logs for delivery errors

---

## System Architecture

### Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB with Drizzle ORM
- **AI Integration**: LLM-powered security analysis
- **Authentication**: Manus OAuth 2.0
- **File Storage**: S3-compatible storage for reports

### Database Schema

**Key Tables:**
- `users`: User accounts and roles
- `scan_targets`: Registered scan targets
- `scans`: Scan execution records
- `vulnerabilities`: Detected security issues
- `security_recommendations`: AI-generated fixes
- `reports`: Generated PDF reports
- `notifications`: User notifications
- `scheduled_scans`: Recurring scan schedules

---

## Support & Feedback

For issues, feature requests, or general support:
- Contact: support@cyberlocked.io
- Documentation: https://docs.cyberlocked.io
- Status Page: https://status.cyberlocked.io

---

## License

CyberLocked is proprietary software. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: May 25, 2026  
**Status**: Production Ready
