CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`route` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`carModel` varchar(255) NOT NULL,
	`carPlate` varchar(20),
	`bookingDate` varchar(10) NOT NULL,
	`multipleVehicles` int NOT NULL DEFAULT 0,
	`videoUpgrade` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
