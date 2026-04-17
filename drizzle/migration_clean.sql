-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`name` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);

-- Create systemConfig table if it doesn't exist
CREATE TABLE IF NOT EXISTS `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(128) NOT NULL,
	`configValue` text,
	`dataType` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_configKey_unique` UNIQUE(`configKey`)
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS `transactions` (
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

-- Create whatsappMessages table if it doesn't exist
CREATE TABLE IF NOT EXISTS `whatsappMessages` (
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
