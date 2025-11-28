CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`circleId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`isEncrypted` int NOT NULL DEFAULT 1,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `circleMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`circleId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','moderator','owner') DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `circleMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `circles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`isModerated` int NOT NULL DEFAULT 1,
	`maxMembers` int DEFAULT 5,
	`encryptionKey` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `circles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentHashes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hash` varchar(128) NOT NULL,
	`hashType` varchar(32) DEFAULT 'pdq',
	`incidentId` int,
	`userId` int,
	`status` enum('active','removed','pending') DEFAULT 'active',
	`platforms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentHashes_id` PRIMARY KEY(`id`),
	CONSTRAINT `contentHashes_hash_unique` UNIQUE(`hash`)
);
--> statement-breakpoint
CREATE TABLE `detectionLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`platform` varchar(64) NOT NULL,
	`detectionType` varchar(64) NOT NULL,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`content` text,
	`aiModel` varchar(64),
	`confidence` int,
	`wasBlocked` int DEFAULT 0,
	`userAction` varchar(64),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detectionLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`anonymousId` varchar(64),
	`title` varchar(255),
	`description` text,
	`platform` varchar(64),
	`incidentType` varchar(64),
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`status` enum('pending','reviewed','resolved','escalated') DEFAULT 'pending',
	`evidenceUrls` text,
	`contentHash` varchar(128),
	`location` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legalCases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`incidentId` int,
	`caseNumber` varchar(64),
	`country` varchar(64),
	`caseType` varchar(64),
	`status` enum('draft','filed','in_progress','resolved') DEFAULT 'draft',
	`documents` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalCases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peerMatchQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interests` text,
	`supportType` varchar(64),
	`language` varchar(8),
	`country` varchar(64),
	`status` enum('waiting','matched','cancelled') DEFAULT 'waiting',
	`matchedWith` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`matchedAt` timestamp,
	CONSTRAINT `peerMatchQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `takedownRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`incidentId` int,
	`platform` varchar(64) NOT NULL,
	`requestType` varchar(64),
	`contentUrl` text,
	`status` enum('pending','submitted','approved','rejected') DEFAULT 'pending',
	`responseData` text,
	`submittedAt` timestamp,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `takedownRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trustedContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`contactEmail` varchar(320),
	`contactPhone` varchar(32),
	`relationship` varchar(64),
	`isVerified` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trustedContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sensitivity` enum('low','balanced','high') DEFAULT 'balanced',
	`autoHide` int NOT NULL DEFAULT 1,
	`enableNotifications` int NOT NULL DEFAULT 1,
	`enableGPS` int NOT NULL DEFAULT 0,
	`enableHeartAnimations` int NOT NULL DEFAULT 1,
	`language` varchar(8) DEFAULT 'en',
	`country` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_circleId_circles_id_fk` FOREIGN KEY (`circleId`) REFERENCES `circles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatMessages` ADD CONSTRAINT `chatMessages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `circleMembers` ADD CONSTRAINT `circleMembers_circleId_circles_id_fk` FOREIGN KEY (`circleId`) REFERENCES `circles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `circleMembers` ADD CONSTRAINT `circleMembers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `circles` ADD CONSTRAINT `circles_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentHashes` ADD CONSTRAINT `contentHashes_incidentId_incidents_id_fk` FOREIGN KEY (`incidentId`) REFERENCES `incidents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contentHashes` ADD CONSTRAINT `contentHashes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `detectionLogs` ADD CONSTRAINT `detectionLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legalCases` ADD CONSTRAINT `legalCases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `legalCases` ADD CONSTRAINT `legalCases_incidentId_incidents_id_fk` FOREIGN KEY (`incidentId`) REFERENCES `incidents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peerMatchQueue` ADD CONSTRAINT `peerMatchQueue_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peerMatchQueue` ADD CONSTRAINT `peerMatchQueue_matchedWith_users_id_fk` FOREIGN KEY (`matchedWith`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedownRequests` ADD CONSTRAINT `takedownRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `takedownRequests` ADD CONSTRAINT `takedownRequests_incidentId_incidents_id_fk` FOREIGN KEY (`incidentId`) REFERENCES `incidents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `trustedContacts` ADD CONSTRAINT `trustedContacts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userSettings` ADD CONSTRAINT `userSettings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;