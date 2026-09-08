import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { AuthenticatedRequest, AuthenticatedUser } from '../access.types';
import { JwtAuthGuard } from './jwt-auth.guard';

// The guard verifies against Keycloak's JWKS via a real `jwks-rsa` client — mocking
// `jsonwebtoken.verify` itself controls what it resolves to without needing a live Keycloak
// or a real RSA keypair.
jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

const verifyMock = jwt.verify as unknown as jest.Mock;

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

function invokeDecoded(payload: Record<string, unknown> | null, error?: Error) {
  verifyMock.mockImplementation(
    (
      _token: string,
      _key: unknown,
      _options: unknown,
      callback: (error: Error | null, decoded?: Record<string, unknown>) => void,
    ) => {
      callback(error ?? null, payload ?? undefined);
    },
  );
}

describe('JwtAuthGuard', () => {
  const authenticatedUser: AuthenticatedUser = {
    id: 'user-1',
    identitySubject: 'kc-sub-1',
    isActive: true,
    permissions: new Set(['page.read']),
  };
  let identityService: { resolveFromToken: jest.Mock };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    verifyMock.mockReset();
    identityService = { resolveFromToken: jest.fn().mockResolvedValue(authenticatedUser) };
    guard = new JwtAuthGuard(identityService as never);
  });

  it('rejects a request with no Authorization header', async () => {
    await expect(guard.canActivate(contextWithAuthHeader(undefined))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    await expect(guard.canActivate(contextWithAuthHeader('Basic abc123'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when jsonwebtoken reports the token invalid or expired', async () => {
    invokeDecoded(null, new Error('jwt expired'));
    await expect(guard.canActivate(contextWithAuthHeader('Bearer x'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a token issued for a different client', async () => {
    invokeDecoded({ sub: 'kc-sub-1', azp: 'some-other-client', exp: 9999999999 });
    await expect(guard.canActivate(contextWithAuthHeader('Bearer x'))).rejects.toThrow(
      'Token was not issued for this client',
    );
  });

  it('rejects a token whose azp claim is missing entirely', async () => {
    invokeDecoded({ sub: 'kc-sub-1', exp: 9999999999 });
    await expect(guard.canActivate(contextWithAuthHeader('Bearer x'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('resolves the caller by the token sub and attaches it to the request', async () => {
    invokeDecoded({ sub: 'kc-sub-1', azp: 'ttu-web', exp: 9999999999 });
    const context = contextWithAuthHeader('Bearer x');

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    expect(identityService.resolveFromToken).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'kc-sub-1', azp: 'ttu-web' }),
    );
    expect(request.user).toBe(authenticatedUser);
  });
});
