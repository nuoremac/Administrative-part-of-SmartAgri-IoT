export enum UserRole {
  ADMIN = "ADMIN",
  FARMER = "FARMER",
}

export type MockUser = {
  id: string;
  email: string;
  role: UserRole;
};

// ⚠️ MOCK DATABASE (temporary)
const ADMIN_USER: MockUser = {
  id: "admin-1",
  email: "admin@smartagro.com",
  role: UserRole.ADMIN,
};

// Mock admin security code
const ADMIN_SECURITY_CODE = "AGRO-ADMIN1-2026";

/**
 * Mock admin login
 */
export function mockAdminLogin(
  email: string,
  code: string
): MockUser | null {
  if (
    email.toLowerCase() === ADMIN_USER.email &&
    code === ADMIN_SECURITY_CODE
  ) {
    return ADMIN_USER;
  }

  return null;
}
