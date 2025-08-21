export const ERROR_MESSAGES = {
  JWT: {
    MISSING_SECRET: 'JWT_SECRET or JWT_REFRESH_SECRET is not defined in the .env file',
    MISSING_TTL: 'JWT_ACCESS_TTL or JWT_REFRESH_TTL is not defined in the .env file',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
  },
  REFRESH_TOKEN: {
    MISSING: 'Refresh token is required',
    INVALID: 'Invalid refresh token',
    EXPIRED: 'Refresh token has expired',
    REVOKED: 'Refresh token has been revoked',
    MISMATCH: 'Refresh token mismatch',
  }
};
export const PRIMSA_EXCEPTIONS = {
  CONFLICT: {
    message: 'Record already exists',
    code: 'P2002',
  },
  NOT_FOUND: {
    message: 'Record not found',
    code: 'P2025',
  },
  DATABASE_ERROR: {
    message: 'Database error occurred',
  }
};