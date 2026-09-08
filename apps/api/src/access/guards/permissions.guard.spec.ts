import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest, AuthenticatedUser } from '../access.types';
import { REQUIRE_PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PermissionsGuard } from './permissions.guard';

function contextRequiring(
  permission: string | undefined,
  user?: AuthenticatedUser,
): ExecutionContext {
  const request = { user } as AuthenticatedRequest;
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ExecutionContext;
}

function userWith(...permissions: string[]): AuthenticatedUser {
  return {
    id: 'user-1',
    identitySubject: 'kc-sub-1',
    isActive: true,
    permissions: new Set(permissions),
  };
}

describe('PermissionsGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new PermissionsGuard(reflector as unknown as Reflector);
  });

  it('allows a route with no @RequirePermission() metadata regardless of the caller', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextRequiring(undefined))).toBe(true);
  });

  it('allows a caller whose permission set contains the required code', () => {
    reflector.getAllAndOverride.mockReturnValue('page.publish');
    const context = contextRequiring('page.publish', userWith('page.publish', 'page.edit'));
    expect(guard.canActivate(context)).toBe(true);
  });

  it('403s a caller whose permission set is missing the required code', () => {
    reflector.getAllAndOverride.mockReturnValue('page.publish');
    const context = contextRequiring('page.publish', userWith('page.edit'));
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('403s a request with no resolved user at all', () => {
    reflector.getAllAndOverride.mockReturnValue('page.publish');
    const context = contextRequiring('page.publish', undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('reads the metadata key both decorators actually set', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    guard.canActivate(contextRequiring(undefined));
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      REQUIRE_PERMISSION_KEY,
      expect.any(Array),
    );
  });
});
