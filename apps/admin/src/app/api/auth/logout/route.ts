import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';

/**
 * Ends TTU Platform's own session only (design doc 07 §5: "Logout khỏi Admin phải kết thúc session
 * của TTU Platform; SSO logout toàn hệ thống chỉ thực hiện theo policy của TTU Identity") — clears
 * the session cookie and lets `middleware.ts` send the next request back through login. `POST`-only
 * so a prefetched or embedded `GET` link can never trigger a logout.
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
