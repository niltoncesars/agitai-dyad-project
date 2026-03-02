CREATE TABLE `stripe_customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`stripe_customer_id` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_customers_user_id_unique` UNIQUE(`user_id`),
	CONSTRAINT `stripe_customers_stripe_customer_id_unique` UNIQUE(`stripe_customer_id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`event_title` text NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`price_in_cents` int NOT NULL,
	`stripe_payment_intent_id` varchar(255) NOT NULL,
	`stripe_checkout_session_id` varchar(255),
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ticket_purchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `ticket_purchases_stripe_payment_intent_id_unique` UNIQUE(`stripe_payment_intent_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `stripe_customer_id` varchar(255);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `stripe_customers` (`user_id`);--> statement-breakpoint
CREATE INDEX `stripe_customer_id_idx` ON `stripe_customers` (`stripe_customer_id`);--> statement-breakpoint
CREATE INDEX `purchase_user_id_idx` ON `ticket_purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `purchase_event_id_idx` ON `ticket_purchases` (`event_id`);--> statement-breakpoint
CREATE INDEX `stripe_payment_intent_id_idx` ON `ticket_purchases` (`stripe_payment_intent_id`);--> statement-breakpoint
CREATE INDEX `purchase_status_idx` ON `ticket_purchases` (`status`);--> statement-breakpoint
CREATE INDEX `user_stripe_customer_id_idx` ON `users` (`stripe_customer_id`);