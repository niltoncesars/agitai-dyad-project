CREATE TABLE `favorite_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`event_title` text NOT NULL,
	`event_city` varchar(255) NOT NULL,
	`event_category` varchar(255) NOT NULL,
	`event_price` decimal(10,2),
	`event_date` varchar(255),
	`event_image_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorite_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `favorite_user_id_idx` ON `favorite_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `favorite_event_id_idx` ON `favorite_events` (`event_id`);--> statement-breakpoint
CREATE INDEX `favorite_user_event_idx` ON `favorite_events` (`user_id`,`event_id`);