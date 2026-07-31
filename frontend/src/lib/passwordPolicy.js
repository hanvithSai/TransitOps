/** Mirror of backend/utils/passwordPolicy.js — keep rules in sync. */

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
  { id: 'spaces', label: 'No spaces', test: (p) => !/\s/.test(p) },
];

export const validatePasswordStrength = (password) => {
  if (!password) {
    return { valid: false, errors: ['Password is required.'], results: [] };
  }

  const results = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }));

  return {
    valid: results.every((r) => r.passed),
    errors: results.filter((r) => !r.passed).map((r) => {
      if (r.id === 'length') return 'Password must be at least 6 characters.';
      if (r.id === 'spaces') return 'Password must not contain spaces.';
      if (r.id === 'upper') return 'Password must include an uppercase letter.';
      if (r.id === 'lower') return 'Password must include a lowercase letter.';
      if (r.id === 'number') return 'Password must include a number.';
      if (r.id === 'special') return 'Password must include a special character.';
      return r.label;
    }),
    results,
  };
};

/** Generate a random password that satisfies the policy (for admin resets). */
export const generateSecurePassword = (length = 12) => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const nums = '23456789';
  const special = '!@#$%^&*';
  const all = upper + lower + nums + special;
  const pick = (chars) => chars[Math.floor(Math.random() * chars.length)];

  let password = pick(upper) + pick(lower) + pick(nums) + pick(special);
  while (password.length < length) password += pick(all);

  return password;
};

const AUTH_ONLY_PATHS = new Set(['/', '/login', '/register', '/forgot-password', '/update-password', '/unauthorized']);

export const getPostLoginPath = (fromPath, requiresPasswordChange = false) => {
  if (requiresPasswordChange) return '/update-password';
  if (fromPath && !AUTH_ONLY_PATHS.has(fromPath)) return fromPath;
  return '/dashboard';
};
