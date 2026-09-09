/**
 * Placeholder configuration for unit tests.
 *
 * `config/database.ts` and `config/auth.ts` validate every required variable the moment they are
 * imported — so importing a guard/service into a spec is enough to fail without this. Specs mock
 * the database client and jsonwebtoken directly and never open a real connection or verify a real
 * token; these values exist only to get past that validation. `??=` leaves a real environment (e.g.
 * a developer's `.env`) alone.
 */
process.env.DATABASE_URL ??= 'postgres://test:test@localhost:5432/test';
process.env.KEYCLOAK_ISSUER_URL ??= 'http://localhost:8080/realms/ttu-test';
process.env.S3_ENDPOINT ??= 'http://localhost:9000';
process.env.S3_BUCKET ??= 'ttu-test-media';
process.env.S3_ACCESS_KEY ??= 'test-access-key';
process.env.S3_SECRET_KEY ??= 'test-secret-key';
