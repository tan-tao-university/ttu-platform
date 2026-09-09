import 'server-only';
import { authConfig } from '../auth/config';

/** Mirrors `apps/api/src/access/controllers/me.controller.ts`'s response shape. */
export interface AdminMe {
  id: string;
  identitySubject: string;
  isActive: boolean;
  permissions: string[];
}

export async function fetchAdminMe(accessToken: string): Promise<AdminMe> {
  const response = await fetch(`${authConfig.apiUrl}/admin/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`GET /admin/me returned ${response.status}`);
  }
  return response.json();
}
