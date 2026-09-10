import 'server-only';
import { getAuthConfig } from '../auth/config';

/** Mirrors `apps/api/src/access/controllers/me.controller.ts`'s response shape. */
export interface Me {
  id: string;
  identitySubject: string;
  isActive: boolean;
  permissions: string[];
}

export async function fetchMe(accessToken: string): Promise<Me> {
  const response = await fetch(`${getAuthConfig().apiUrl}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`GET /me returned ${response.status}`);
  }
  return response.json();
}
