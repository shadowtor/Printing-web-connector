process.env.NODE_ENV ??= "test";
process.env.PORT ??= "8081";
process.env.HOST ??= "127.0.0.1";
process.env.DATABASE_URL ??= "postgresql://connector:connector@localhost:5432/bambu_connector";
process.env.PRINTING_WEB_BASE_URL ??= "http://localhost:3000";
process.env.SERVICE_AUTH_SHARED_SECRET ??= "test-shared-secret-1234";
process.env.ADMIN_AUTH_SECRET ??= "test-admin-secret-1234";
process.env.BAMBU_PRINTERS_JSON ??= "[]";
