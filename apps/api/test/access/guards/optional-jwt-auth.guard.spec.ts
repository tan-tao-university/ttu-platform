import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, AuthenticatedUser } from '@/access/access.types';
import { OptionalJwtAuthGuard } from '@/access/guards/optional-jwt-auth.guard';

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

describe('OptionalJwtAuthGuard', () => {
  const authenticatedUser: AuthenticatedUser = {
    id: 'user-1',
    identitySubject: 'kc-sub-1',
    isActive: true,
    permissions: new Set(['content.read']),
  };
  let tokenVerification: { verify: jest.Mock };
  let identityService: { resolveFromToken: jest.Mock };
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    tokenVerification = { verify: jest.fn() };
    identityService = { resolveFromToken: jest.fn().mockResolvedValue(authenticatedUser) };
    guard = new OptionalJwtAuthGuard(tokenVerification as never, identityService as never);
  });

  it('allows a request with no Authorization header through as anonymous', async () => {
    const context = contextWithAuthHeader(undefined);
    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(tokenVerification.verify).not.toHaveBeenCalled();
    expect(context.switchToHttp().getRequest<AuthenticatedRequest>().user).toBeUndefined();
  });

  it('treats a non-Bearer Authorization header the same as no token — anonymous, not an error', async () => {
    const context = contextWithAuthHeader('Basic abc123');
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(tokenVerification.verify).not.toHaveBeenCalled();
  });

  it('rejects a Bearer token that fails verification rather than silently downgrading to anonymous', async () => {
    tokenVerification.verify.mockRejectedValue(new UnauthorizedException('bad token'));
    await expect(guard.canActivate(contextWithAuthHeader('Bearer x'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('resolves and attaches the caller when a valid Bearer token is presented', async () => {
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
