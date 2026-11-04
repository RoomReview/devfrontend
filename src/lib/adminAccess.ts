type AdminUserIdentity = {
  email?: string | null;
  role?: string | null;
};

const SUPER_ADMIN_EMAILS = new Set([
  'roomrevievsuperpuperadmin@roomreview.co.uk',
]);

const STANDARD_ADMIN_EMAILS = new Set([
  'federico@roomreview.co.uk',
  'yuliia@roomreview.co.uk',
]);

const BLOG_PUBLISHER_EMAILS = new Set([
  'meghamayuri@roomreview.co.uk',
]);

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? '';

export const canAccessAdminDashboard = (user: AdminUserIdentity | null | undefined) => {
  if (user?.role !== 'ADMIN') return false;
  const email = normalizeEmail(user.email);
  return SUPER_ADMIN_EMAILS.has(email) || STANDARD_ADMIN_EMAILS.has(email);
};

export const canViewAdminAuditLog = (user: AdminUserIdentity | null | undefined) =>
  user?.role === 'ADMIN' && SUPER_ADMIN_EMAILS.has(normalizeEmail(user.email));

export const canCreateBlogPost = (user: AdminUserIdentity | null | undefined) => {
  if (user?.role !== 'ADMIN') return false;
  const email = normalizeEmail(user.email);
  return SUPER_ADMIN_EMAILS.has(email)
    || STANDARD_ADMIN_EMAILS.has(email)
    || BLOG_PUBLISHER_EMAILS.has(email);
};

export const canManageBlogPosts = (user: AdminUserIdentity | null | undefined) => {
  if (user?.role !== 'ADMIN') return false;
  const email = normalizeEmail(user.email);
  return SUPER_ADMIN_EMAILS.has(email) || STANDARD_ADMIN_EMAILS.has(email);
};
