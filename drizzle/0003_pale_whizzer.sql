CREATE TABLE `event_price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`event_title` text NOT NULL,
	`previous_price` decimal(10,2) NOT NULL,
	`current_price` decimal(10,2) NOT NULL,
	`price_change_percent` decimal(5,2) NOT NULL,
	`reason` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `event_price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`enable_upcoming_events` boolean NOT NULL DEFAULT true,
	`enable_price_changes` boolean NOT NULL DEFAULT true,
	`enable_favorite_updates` boolean NOT NULL DEFAULT true,
	`upcoming_events_radius` int NOT NULL DEFAULT 50,
	`upcoming_events_days_before` int NOT NULL DEFAULT 7,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`event_id` varchar(255),
	`type` enum('upcoming_event','price_change','favorite_update','purchase_confirmation') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`action_url` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`read_at` timestamp,
	CONSTRAINT `user_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `price_history_event_id_idx` ON `event_price_history` (`event_id`);--> statement-breakpoint
CREATE INDEX `price_history_created_at_idx` ON `event_price_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `notif_pref_user_id_idx` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE INDEX `notif_user_id_idx` ON `user_notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notif_event_id_idx` ON `user_notifications` (`event_id`);--> statement-breakpoint
CREATE INDEX `notif_type_idx` ON `user_notifications` (`type`);--> statement-breakpoint
CREATE INDEX `notif_is_read_idx` ON `user_notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `notif_user_read_idx` ON `user_notifications` (`user_id`,`is_read`);