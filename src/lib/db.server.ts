import Database from "better-sqlite3";
import { resolve } from "path";

const DB_PATH = resolve(process.cwd(), "data.db");

let _db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS membres (
      id TEXT PRIMARY KEY,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS years (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      membre_id TEXT NOT NULL,
      destination_id TEXT,
      destination_name TEXT NOT NULL DEFAULT '',
      mission TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (membre_id) REFERENCES membres(id) ON DELETE CASCADE,
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
    );
  `);
}
