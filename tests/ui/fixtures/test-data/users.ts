// SauceDemo accounts – one place for all login data so we don't scatter creds in specs.
export const VALID_USERS = {
  standard: { username: "standard_user", password: "secret_sauce" },
  locked: { username: "locked_out_user", password: "secret_sauce" },
  problem: { username: "problem_user", password: "secret_sauce" },
  glitch: { username: "performance_glitch_user", password: "secret_sauce" },
  error: { username: "error_user", password: "secret_sauce" },
  visual: { username: "visual_user", password: "secret_sauce" },
} as const;

export type LoginUserRole = keyof typeof VALID_USERS;

// Factory method constructs and returns a credential object for the requested role.
// Specs can use getLoginUser("standard") rather than referencing raw strings tied to the type.
export function getLoginUser(role: LoginUserRole): {
  username: string;
  password: string;
} {
  return { ...VALID_USERS[role] };
}
