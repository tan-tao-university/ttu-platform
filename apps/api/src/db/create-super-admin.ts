import { parseArgs } from 'node:util';
import { and, eq } from 'drizzle-orm';
import { client, db } from './index';
import { roles, userRoleAssignments, users } from './schema';

/**
 * Bootstraps the first `super_admin` (design doc 07 §15) — the only way a `super_admin`
 * assignment gets created. Nothing in the Admin API can self-escalate to it.
 *
 * The account must already exist in TTU Identity/Keycloak; this script only creates or
 * updates the local `ttu_main` mapping and grants the role. `--sub` is that account's
 * Keycloak `sub` claim, found via the Keycloak Admin Console (Users → the account → ID) —
 * never the email, which is cache/display only and can change without changing identity.
 *
 * Usage:
 *   moon run api:db-create-super-admin -- --sub <keycloak-sub> --email admin@ttu.edu.vn --name "Admin"
 */
async function main() {
  // `moon run <script> -- --sub x` forwards the separator itself, and parseArgs treats
  // everything after a bare `--` as positional. Drop it so both invocation styles work.
  const argv = process.argv.slice(2);
  if (argv[0] === '--') argv.shift();

  const { values } = parseArgs({
    args: argv,
    options: {
      sub: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
    },
  });

  const identitySubject = values.sub?.trim();
  if (!identitySubject) throw new Error('--sub <keycloak-sub> is required');

  const [role] = await db.select({ id: roles.id }).from(roles).where(eq(roles.code, 'super_admin'));
  if (!role) throw new Error('No "super_admin" role — run db:seed first');

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.identitySubject, identitySubject));

  const account =
    existing ??
    (
      await db
        .insert(users)
        .values({
          identitySubject,
          email: values.email?.trim(),
          displayName: values.name?.trim(),
        })
        .returning()
    )[0];

  if (existing) {
    console.log(`User mapping for ${identitySubject} already exists; leaving profile untouched.`);
  } else {
    console.log(`Created local user mapping for ${identitySubject}.`);
  }

  await grantSuperAdmin(account.id, role.id);
  console.log(`Granted "super_admin" to ${identitySubject}.`);
}

/** Idempotent: re-running does not stack duplicate assignments (unique on user_id, role_id). */
async function grantSuperAdmin(userId: string, roleId: string) {
  const [existing] = await db
    .select({ id: userRoleAssignments.id })
    .from(userRoleAssignments)
    .where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.roleId, roleId)));
  if (existing) return;

  await db.insert(userRoleAssignments).values({ userId, roleId });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
