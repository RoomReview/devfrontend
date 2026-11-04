import { describe, expect, it } from 'vitest';
import {
  canAccessAdminDashboard,
  canCreateBlogPost,
  canManageBlogPosts,
  canViewAdminAuditLog,
} from '../src/lib/adminAccess';

describe('account-specific admin UI access', () => {
  it('shows full admin tools only to the main developer account', () => {
    const user = { email: 'ROOMREVIEVSUPERPUPERADMIN@roomreview.co.uk', role: 'ADMIN' };
    expect(canAccessAdminDashboard(user)).toBe(true);
    expect(canViewAdminAuditLog(user)).toBe(true);
    expect(canManageBlogPosts(user)).toBe(true);
  });

  it('allows Federico and Yuliia into the admin dashboard without audit logs', () => {
    for (const email of ['federico@roomreview.co.uk', 'yuliia@roomreview.co.uk']) {
      const user = { email, role: 'ADMIN' };
      expect(canAccessAdminDashboard(user)).toBe(true);
      expect(canViewAdminAuditLog(user)).toBe(false);
    }
  });

  it('allows Megha to upload blogs without exposing admin tools or post management', () => {
    const user = { email: 'MeghaMayuri@roomreview.co.uk', role: 'ADMIN' };
    expect(canAccessAdminDashboard(user)).toBe(false);
    expect(canCreateBlogPost(user)).toBe(true);
    expect(canManageBlogPosts(user)).toBe(false);
  });
});
