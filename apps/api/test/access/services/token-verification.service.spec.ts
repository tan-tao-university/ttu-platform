import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { TokenVerificationService } from '@/access/services/token-verification.service';

/**
 * The service verifies against Keycloak's JWKS via a real `jwks-rsa` client — mocking
 * `jsonwebtoken.verify` controls what it resolves to without needing a live Keycloak.
 */
jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

const verifyMock = jwt.verify as unknown as jest.Mock;

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

describe('TokenVerificationService', () => {
  let service: TokenVerificationService;

  beforeEach(() => {
    verifyMock.mockReset();
    service = new TokenVerificationService();
  });

  it('rejects when jsonwebtoken reports the token invalid or expired', async () => {
    invokeDecoded(null, new Error('jwt expired'));
    await expect(service.verify('x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token issued for a different client', async () => {
    invokeDecoded({ sub: 'kc-sub-1', azp: 'some-other-client', exp: 9999999999 });
    await expect(service.verify('x')).rejects.toThrow('Token was not issued for this client');
  });

  it('rejects a token whose azp claim is missing entirely', async () => {
    invokeDecoded({ sub: 'kc-sub-1', exp: 9999999999 });
    await expect(service.verify('x')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('resolves the payload for a valid token issued for this client', async () => {
    invokeDecoded({ sub: 'kc-sub-1', azp: 'ttu-web', exp: 9999999999 });
    await expect(service.verify('x')).resolves.toEqual(
      expect.objectContaining({ sub: 'kc-sub-1', azp: 'ttu-web' }),
    );
  });
});
