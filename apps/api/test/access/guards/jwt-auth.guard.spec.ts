import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, AuthenticatedUser } from '@/access/access.types';
import { JwtAuthGuard } from '@/access/guards/jwt-auth.guard';

function contextWithAuthHeader(authorization?: string): ExecutionContext {
  const request = { headers: { authorization } } as AuthenticatedRequest;
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const authenticatedUser: AuthenticatedUser = {
    id: 'user-1',
    identitySubject: 'kc-sub-1',
    isActive: true,
    permissions: new Set(['page.read']),
  };
  let tokenVerification: { verify: jest.Mock };
  let identityService: { resolveFromToken: jest.Mock };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    tokenVerification = { verify: jest.fn() };
    identityService = { resolveFromToken: jest.fn().mockResolvedValue(authenticatedUser) };
    guard = new JwtAuthGuard(tokenVerification as never, identityService as never);
  });

  it('rejects a request with no Authorization header', async () => {
    await expect(guard.canActivate(contextWithAuthHeader(undefined))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokenVerification.verify).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    await expect(guard.canActivate(contextWithAuthHeader('Basic abc123'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(tokenVerification.verify).not.toHaveBeenCalled();
  });

  it('propagates a token verification failure', async () => {
    tokenVerification.verify.mockRejectedValue(new UnauthorizedException('bad token'));
    await expect(guard.canActivate(contextWithAuthHeader('Bearer x'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('resolves the caller from a verified token and attaches it to the request', async () => {
    tokenVerification.verify.mockResolvedValue({
      sub: 'kc-sub-1',
      azp: 'ttu-web',
      exp: 9999999999,
    });
    const context = contextWithAuthHeader('Bearer x');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    expect(identityService.resolveFromToken).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'kc-sub-1' }),
    );
    expect(request.user).toBe(authenticatedUser);
  });
});
