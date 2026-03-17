import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

export interface OutboxRow {
  id: number;
  destination: string;
  payload: string;
  created_at: number;
  delivered_at: number | null;
}

const TABLE = "outbox";
const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS ${TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  destination TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  delivered_at INTEGER
);
CREATE INDEX IF NOT EXISTS outbox_pending ON ${TABLE}(delivered_at, created_at) WHERE delivered_at IS NULL;
`;

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function persist(db: SqlJsDatabase, filePath: string): void {
  const data = db.export();
  writeFileSync(filePath, Buffer.from(data));
}

export async function openOutboxDb(
  filePath: string
): Promise<{ db: SqlJsDatabase; persist: () => void }> {
  ensureDir(filePath);
  const SQL = await initSqlJs();
  let db: SqlJsDatabase;
  if (existsSync(filePath)) {
    const buf = readFileSync(filePath);
    db = new SQL.Database(buf);
  } else {
    db = new SQL.Database();
  }
  db.run(CREATE_SQL);
  const save = () => persist(db, filePath);
  return { db, persist: save };
}

export function enqueue(
  db: SqlJsDatabase,
  persistFn: () => void,
  destination: string,
  payload: unknown
): number {
  db.run(
    `INSERT INTO ${TABLE} (destination, payload, created_at) VALUES (?, ?, ?)`,
    [destination, JSON.stringify(payload), Date.now()]
  );
  const row = db.exec("SELECT last_insert_rowid() as id");
  persistFn();
  const id = row[0]?.values[0]?.[0] as number | undefined;
  return id ?? 0;
}

export function listPending(
  db: SqlJsDatabase,
  limit: number,
  maxAgeMs?: number
): OutboxRow[] {
  const cutoff = maxAgeMs != null ? Date.now() - maxAgeMs : 0;
  const result = db.exec(
    `SELECT id, destination, payload, created_at, delivered_at
     FROM ${TABLE}
     WHERE delivered_at IS NULL AND created_at >= ${Number(cutoff)}
     ORDER BY created_at ASC
     LIMIT ${Number(limit)}`
  );
  if (result.length === 0 || result[0].values.length === 0) return [];
  const { columns, values } = result[0];
  return values.map((row: unknown[]) => {
    const o: Record<string, unknown> = {};
    columns.forEach((c: string, i: number) => (o[c] = row[i]));
    return o as unknown as OutboxRow;
  });
}

export function markDelivered(
  db: SqlJsDatabase,
  persistFn: () => void,
  id: number
): void {
  db.run(`UPDATE ${TABLE} SET delivered_at = ? WHERE id = ?`, [Date.now(), id]);
  persistFn();
}

export function deleteDelivered(
  db: SqlJsDatabase,
  persistFn: () => void,
  id: number
): void {
  db.run(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  persistFn();
}

/** Delete rows older than retentionMs (regardless of delivered). */
export function pruneOlderThan(
  db: SqlJsDatabase,
  persistFn: () => void,
  retentionMs: number
): number {
  const cutoff = Date.now() - retentionMs;
  db.run(`DELETE FROM ${TABLE} WHERE created_at < ?`, [cutoff]);
  const result = db.exec("SELECT changes() as n");
  persistFn();
  const n = result[0]?.values[0]?.[0] as number | undefined;
  return n ?? 0;
}
