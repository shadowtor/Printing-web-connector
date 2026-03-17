declare module "sql.js" {
  export interface Database {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
  }
  export interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }
  export default function initSqlJs(options?: { locateFile?: (file: string) => string }): Promise<{
    Database: new (data?: ArrayBuffer | Uint8Array) => Database;
  }>;
}
