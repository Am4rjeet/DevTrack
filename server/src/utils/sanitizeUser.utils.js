const PUBLIC_USER_FIELDS = [
  'id',
  'email',
  'username',
  'displayName',
  'avatar',
  'bio',
  'isEmailVerified',
  'totalXP',
  'level',
  'currentStreak',
  'longestStreak',
  'lastActivityDate',
  'isProfilePublic',
  'githubUsername',
  'preferences',
  'createdAt',
  'updatedAt',
];

/**
 * Returns only fields safe to expose to the authenticated client.
 * Never includes password, tokens, refresh sessions, or internal role by default.
 */
const sanitizeUserForClient = (user, { includeRole = false } = {}) => {
  const raw = user?.toJSON ? user.toJSON() : { ...user };
  const allowed = includeRole ? [...PUBLIC_USER_FIELDS, 'role'] : PUBLIC_USER_FIELDS;
  const sanitized = {};

  for (const key of allowed) {
    if (raw[key] !== undefined) {
      sanitized[key] = raw[key];
    }
  }

  if (raw._id != null && sanitized.id == null) {
    sanitized.id = String(raw._id);
  }

  return sanitized;
};

export { sanitizeUserForClient, PUBLIC_USER_FIELDS };
