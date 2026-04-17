CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(128) NOT NULL,
	`configValue` text,
	`dataType` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_configKey_unique` UNIQUE(`configKey`)
);

CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`description` text,
	`category` varchar(64),
	`source` varchar(64),
	`whatsappMessageId` varchar(255),
	`processedByAI` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `whatsappMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`fromNumber` varchar(64) NOT NULL,
	`toNumber` varchar(64) NOT NULL,
	`messageType` enum('text','audio','image','document') NOT NULL,
	`messageContent` text,
	`transcription` text,
	`aiResponse` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappMessages_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsappMessages_messageId_unique` UNIQUE(`messageId`)
);

ALTER TABLE `users` DROP INDEX `users_openId_unique`;
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp;
ALTER TABLE `users` ADD `username` varchar(64) NOT NULL;
ALTER TABLE `users` ADD `passwordHash` varchar(255) NOT NULL;
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);
ALTER TABLE `users` DROP COLUMN `openId`;
ALTER TABLE `users` DROP COLUMN `email`;
ALTER TABLE `users` DROP COLUMN `loginMethod`;
