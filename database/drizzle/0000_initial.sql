CREATE TABLE `building` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_default` integer DEFAULT 0,
	`name` text NOT NULL,
	`address` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `contract` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`identifier` text,
	`building_id` integer DEFAULT 1,
	`unit_id` integer NOT NULL,
	FOREIGN KEY (`building_id`) REFERENCES `building`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`unit_id`) REFERENCES `unit`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `contractRevision` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`price_per_unit` real NOT NULL,
	`base_payment` real DEFAULT 0,
	`monthly_payment` real DEFAULT 0,
	`start_date` integer NOT NULL,
	`end_date` integer,
	`contract_id` integer NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `contract`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meter` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`identifier` text,
	`precision` integer NOT NULL,
	`value_before_reset` real DEFAULT 0,
	`is_active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`custom_unit_conversion` real,
	`building_id` integer DEFAULT 1,
	`type_id` integer NOT NULL,
	`unit_id` integer NOT NULL,
	`contract_id` integer,
	FOREIGN KEY (`building_id`) REFERENCES `building`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`type_id`) REFERENCES `meterType`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`unit_id`) REFERENCES `unit`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`contract_id`) REFERENCES `contract`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `meterType` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reading` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`value` real NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`meter_id` integer NOT NULL,
	FOREIGN KEY (`meter_id`) REFERENCES `meter`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `unit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text NOT NULL,
	`conversion_factor` real,
	`base_unit_id` integer,
	FOREIGN KEY (`base_unit_id`) REFERENCES `unit`(`id`) ON UPDATE no action ON DELETE set null
);
