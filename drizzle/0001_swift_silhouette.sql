CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scanId` int,
	`type` enum('scan_completed','critical_vulnerability','system_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scan_targets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdByUserId` int NOT NULL,
	`targetUrl` varchar(2048) NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetType` enum('url','ip','domain') NOT NULL,
	`labels` json DEFAULT ('[]'),
	`status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
	`description` text,
	`lastScannedAt` timestamp,
	`isScheduled` boolean DEFAULT false,
	`scanFrequencyHours` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scan_targets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`initiatedByUserId` int NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL,
	`overallSeverity` enum('critical','high','medium','low','info') DEFAULT 'info',
	`vulnerabilityCount` int DEFAULT 0,
	`riskScore` decimal(5,2) DEFAULT '0',
	`scanData` json,
	`aiAnalysis` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_scans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`targetId` int NOT NULL,
	`frequencyHours` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`nextRunAt` timestamp,
	`lastRunAt` timestamp,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduled_scans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `security_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`priority` enum('critical','high','medium','low') NOT NULL,
	`category` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`implementationSteps` json,
	`effort` enum('low','medium','high') DEFAULT 'medium',
	`isCompleted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `security_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vulnerabilities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scanId` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`severity` enum('critical','high','medium','low','info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` text,
	`recommendation` text,
	`evidence` text,
	`reference` varchar(255),
	`isFalsePositive` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vulnerabilities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','analyst') NOT NULL DEFAULT 'analyst';