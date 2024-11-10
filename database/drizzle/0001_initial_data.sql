-- Custom SQL migration file, put you code below! --
INSERT INTO `building` (`id`, `is_default`, `name`, `address`, `notes`) VALUES (1, 1, 'default', '', '');
--> statement-breakpoint
INSERT INTO `meterType` (`id`, `category`) VALUES (1, 'consumption'), (2, 'generation'), (3, 'consumption:tank');
--> statement-breakpoint
INSERT INTO `unit` (`id`, `name`, `abbreviation`, `conversion_factor`, `base_unit_id`)
VALUES
    (1, 'units.kwh', 'kWh', 1, NULL),
    (2, 'units.mwh', 'MWh', 1000, 1),
    (3, 'units.gwh', 'GWh', 1000000, 1),
    (4, 'units.w', 'W', 0.001, 1),
    (5, 'units.l', 'l', 1, NULL),
    (6, 'units.m3', 'm³', 1000, 5),
    (7, 'units.m3-gas-natural', 'm³', 10.55, 1),
    (8, 'units.percent', '%', 1, null);