export type RefreshPayload = {
  sub: string; // User ID
  email: string;
  jti: string; // JWT ID for token identification and revocation
  refreshToken?: string; // The actual refresh token
}