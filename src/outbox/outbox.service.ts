import { join } from "node:path";
import type { Database as SqlJsDatabase } from "sql.js";
import {
  openOutboxDb,
  enqueue as dbEnqueue,
  listPending,
  markDelivered,
  deleteDelivered,
  pruneOlderThan,
  type OutboxRow
} from "./sqlite-outbox.js";

const DEFAULT_RETENTION_MS = 72 * 60 * 60 * 1000; // 72 hours
const DEFAULT_REPLAY_INTERVAL_MS = 60 * 1000; // 1 minute
const PENDING_BATCH_SIZE = 50;

export type OutboxDeliverFn = (row: OutboxRow) => Promise<boolean>;

export class OutboxService {
  private db: SqlJsDatabase | null = null;
  private persistFn: (() => void) | null = null;
  private dbPath: string;
  private deliverFn: OutboxDeliverFn | null = null;
  private replayTimer: ReturnType<typeof setInterval> | null = null;
  private retentionMs: number;
  private replayIntervalMs: number;

  constructor(
    dataDir: string,
    options?: { retentionMs?: number; replayIntervalMs?: number }
  ) {
    this.dbPath = join(dataDir, "outbox.sqlite");
    this.retentionMs = options?.retentionMs ?? DEFAULT_RETENTION_MS;
    this.replayIntervalMs = options?.replayIntervalMs ?? DEFAULT_REPLAY_INTERVAL_MS;
  }

  /** Open the SQLite outbox DB (idempotent). */
  async open(): Promise<void> {
    if (this.db != null) return;
    const { db, persist } = await openOutboxDb(this.dbPath);
    this.db = db;
    this.persistFn = persist;
  }

  /** Enqueue a message when primary write (Postgres) or push (Printing-web) fails. */
  enqueue(destination: string, payload: unknown): number | null {
    if (this.db == null || this.persistFn == null) return null;
    try {
      return dbEnqueue(this.db, this.persistFn, destination, payload);
    } catch {
      return null;
    }
  }

  /** Parse outbox row payload. */
  parsePayload<T = unknown>(row: OutboxRow): T {
    return JSON.parse(row.payload) as T;
  }

  /** Run one replay pass: list pending, deliver each, mark delivered and delete on success; then prune old rows. */
  async replayOnce(): Promise<{ delivered: number; pruned: number }> {
    if (this.db == null || this.persistFn == null || this.deliverFn == null) {
      return { delivered: 0, pruned: 0 };
    }
    const rows = listPending(this.db, PENDING_BATCH_SIZE, this.retentionMs);
    let delivered = 0;
    for (const row of rows) {
      try {
        const ok = await this.deliverFn(row);
        if (ok) {
          markDelivered(this.db, this.persistFn, row.id);
          deleteDelivered(this.db, this.persistFn, row.id);
          delivered += 1;
        }
      } catch {
        // leave row pending for next pass
      }
    }
    const pruned = pruneOlderThan(this.db, this.persistFn, this.retentionMs);
    return { delivered, pruned };
  }

  /** Start the background replay loop. Call after setting deliverFn via setDeliver. */
  startReplayLoop(): void {
    if (this.replayTimer != null) return;
    this.replayTimer = setInterval(() => {
      void this.replayOnce();
    }, this.replayIntervalMs);
  }

  /** Stop the replay loop. */
  stopReplayLoop(): void {
    if (this.replayTimer != null) {
      clearInterval(this.replayTimer);
      this.replayTimer = null;
    }
  }

  /** Set the delivery function used by the replay loop. */
  setDeliver(fn: OutboxDeliverFn): void {
    this.deliverFn = fn;
  }

  /** Close the DB (e.g. on shutdown). */
  close(): void {
    this.stopReplayLoop();
    if (this.db != null) {
      this.db.close();
      this.db = null;
    }
    this.persistFn = null;
  }
}
