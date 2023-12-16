import { BUILDING_TABLE_NAME, DEFAULT_BUILDING_ID } from '@/buildings/buildings.constants'
import { CONTRACT_TABLE_NAME } from '@/contracts/contracts.constants'
import { MEASUREMENT_TABLE_NAME } from '@/measurements/measurements.constants'
import { METER_TABLE_NAME } from '@/meters/meters.constants'

export default [
  // Version 1
  [
    `
        CREATE TABLE IF NOT EXISTS ${CONTRACT_TABLE_NAME}
        (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            name           TEXT NOT NULL,
            pricePerUnit   REAL NOT NULL,
            identification TEXT,
            createdAt      INTEGER
        );
    `,
    `
        CREATE TABLE IF NOT EXISTS ${METER_TABLE_NAME}
        (
            id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            name               TEXT    NOT NULL,
            digits             INTEGER NOT NULL,
            unit               TEXT    NOT NULL,
            contract_id        INTEGER,
            areValuesDepleting INTEGER,
            isActive           INTEGER,
            identification     TEXT,
            createdAt          INTEGER,
            sortingOrder       INTEGER,
            FOREIGN KEY (contract_id) REFERENCES ${CONTRACT_TABLE_NAME} (id)
        );
    `,
    `
        CREATE TABLE IF NOT EXISTS ${MEASUREMENT_TABLE_NAME}
        (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            value     REAL    NOT NULL,
            meter_id  INTEGER NOT NULL,
            createdAt INTEGER,
            FOREIGN KEY (meter_id) REFERENCES meter (id)
        );
    `,
  ],
  // Version 2
  [
    `
        ALTER TABLE ${CONTRACT_TABLE_NAME}
            ADD COLUMN __v INTEGER DEFAULT 0;
    `,
    `
        ALTER TABLE ${METER_TABLE_NAME}
            ADD COLUMN __v INTEGER DEFAULT 0;
    `,
    `
        ALTER TABLE ${MEASUREMENT_TABLE_NAME}
            ADD COLUMN __v INTEGER DEFAULT 0;
    `,
  ],
  // Version 3
  [
    `
        ALTER TABLE ${CONTRACT_TABLE_NAME}
            ADD COLUMN conversion REAL DEFAULT 1;
    `,
  ],
  // Version 4
  [
    `
        ALTER TABLE ${METER_TABLE_NAME}
            ADD COLUMN isRefillable INTEGER DEFAULT 0;
    `,
  ],
  // Version 5
  [
    `
        CREATE TABLE IF NOT EXISTS ${BUILDING_TABLE_NAME}
        (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL,
            address   TEXT,
            notes     TEXT,
            createdAt INTEGER,
            __v       INTEGER
        );`,
    `
        INSERT OR IGNORE INTO ${BUILDING_TABLE_NAME} (id, name, createdAt)
        VALUES (${DEFAULT_BUILDING_ID}, 'default', ${Date.now()});`,
    `
        ALTER TABLE ${METER_TABLE_NAME}
            ADD COLUMN building_id INTEGER DEFAULT ${DEFAULT_BUILDING_ID} REFERENCES ${BUILDING_TABLE_NAME} (id) ON DELETE SET DEFAULT;
    `,
    `
        UPDATE ${METER_TABLE_NAME}
        SET building_id = ${DEFAULT_BUILDING_ID}
        WHERE building_id IS NULL;
    `,
  ],
  // Version 6
  [
    `
        ALTER TABLE ${METER_TABLE_NAME}
            RENAME TO old_${METER_TABLE_NAME};
    `,
    `
        CREATE TABLE IF NOT EXISTS ${METER_TABLE_NAME}
        (
            id                 INTEGER PRIMARY KEY AUTOINCREMENT,
            name               TEXT    NOT NULL,
            digits             INTEGER NOT NULL,
            unit               TEXT    NOT NULL,
            contract_id        INTEGER,
            areValuesDepleting INTEGER,
            isActive           INTEGER,
            identification     TEXT,
            createdAt          INTEGER,
            sortingOrder       INTEGER,
            isRefillable       INTEGER DEFAULT 0,
            building_id        INTEGER DEFAULT ${DEFAULT_BUILDING_ID} REFERENCES ${BUILDING_TABLE_NAME} (id) ON DELETE SET DEFAULT,
            __v                INTEGER DEFAULT 0,
            FOREIGN KEY (contract_id) REFERENCES ${CONTRACT_TABLE_NAME} (id) ON DELETE SET NULL
        );
    `,
    `
        ALTER TABLE ${MEASUREMENT_TABLE_NAME}
            RENAME TO old_${MEASUREMENT_TABLE_NAME};
    `,
    `
        CREATE TABLE IF NOT EXISTS ${MEASUREMENT_TABLE_NAME}
        (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            value     REAL    NOT NULL,
            meter_id  INTEGER NOT NULL,
            createdAt INTEGER,
            __v       INTEGER DEFAULT 0,
            FOREIGN KEY (meter_id) REFERENCES meter (id) ON DELETE CASCADE
        );
    `,
    `
        INSERT INTO ${METER_TABLE_NAME} (id, name, digits, unit, contract_id, areValuesDepleting, isActive,
                                         identification, createdAt, sortingOrder, isRefillable, building_id, __v)
        SELECT id,
               name,
               digits,
               unit,
               contract_id,
               areValuesDepleting,
               isActive,
               identification,
               createdAt,
               sortingOrder,
               isRefillable,
               building_id,
               __v
        FROM old_${METER_TABLE_NAME};
    `,
    `
        INSERT INTO ${MEASUREMENT_TABLE_NAME} (id, value, meter_id, createdAt, __v)
        SELECT id, value, meter_id, createdAt, __v
        FROM old_${MEASUREMENT_TABLE_NAME};
    `,
    `
        DROP TABLE old_${MEASUREMENT_TABLE_NAME};
    `,
    `
        DROP TABLE old_${METER_TABLE_NAME};
    `,
  ],
]
