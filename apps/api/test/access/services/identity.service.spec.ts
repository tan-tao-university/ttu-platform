import type { UserWithPermissions } from '@/access/repositories/users.repository';
import { IdentityService } from '@/access/services/identity.service';

describe('IdentityService', () => {
  function serviceReturning(user: UserWithPermissions) {
    const usersRepository = { findOrCreateByIdentitySubject: jest.fn().mockResolvedValue(user) };
    return { service: new IdentityService(usersRepository as never), usersRepository };
  }

  it('passes the token sub and profile claims through to JIT provisioning', async () => {
    const { service, usersRepository } = serviceReturning({
      id: 'user-1',
      identitySubject: 'kc-sub-1',
      email: null,
      displayName: null,
      isActive: true,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
    });

    await service.resolveFromToken({
      sub: 'kc-sub-1',
      iss: 'http://localhost:8080/realms/ttu',
      azp: 'ttu-web',
      exp: 9999999999,
      email: 'person@ttu.edu.vn',
      name: 'A Person',
    });

    expect(usersRepository.findOrCreateByIdentitySubject).toHaveBeenCalledWith('kc-sub-1', {
      email: 'person@ttu.edu.vn',
      displayName: 'A Person',
    });
  });

  it("carries an active user's permission set through unchanged", async () => {
    const { service } = serviceReturning({
      id: 'user-1',
      identitySubject: 'kc-sub-1',
      email: null,
      displayName: null,
      isActive: true,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['page.read', 'page.publish'],
    });

    const authenticated = await service.resolveFromToken({
      sub: 'kc-sub-1',
      iss: 'http://localhost:8080/realms/ttu',
      azp: 'ttu-web',
      exp: 9999999999,
    });

    expect([...authenticated.permissions].sort()).toEqual(['page.publish', 'page.read']);
  });

  it("collapses a deactivated user's permission set to empty, even if grants still exist", async () => {
    // A revoked/deactivated user is not deleted (doc 07 §16 — audit/publish history must
    // keep referencing them), so `user_role_assignments` can still list grants. `is_active`
    // has to fence access without depending on every grant being cleaned up too.
    const { service } = serviceReturning({
      id: 'user-1',
      identitySubject: 'kc-sub-1',
      email: null,
      displayName: null,
      isActive: false,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['page.publish', 'user.manage'],
    });

    const authenticated = await service.resolveFromToken({
      sub: 'kc-sub-1',
      iss: 'http://localhost:8080/realms/ttu',
      azp: 'ttu-web',
      exp: 9999999999,
    });

    expect(authenticated.isActive).toBe(false);
    expect(authenticated.permissions.size).toBe(0);
  });
});
