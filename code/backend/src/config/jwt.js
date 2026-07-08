/**
 * Central JWT configuration.
 *
 * Single source of truth for JWT secrets and lifetimes so that the token
 * signer (security/authService.js) and the verifier (middleware/auth.js)
 * can never resolve different values. Resolving these independently caused
 * verification to fail whenever JWT_SECRET was unset, because the signer fell
 * back to a development default while the verifier passed undefined.
 */

const jwtSecret =
  process.env.JWT_SECRET || "default-jwt-secret-for-development";
const refreshSecret =
  process.env.REFRESH_TOKEN_SECRET || "default-refresh-secret-for-development";
const jwtExpiry = process.env.JWT_EXPIRE || "15m";
const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRE || "7d";

const usingDefaults =
  jwtSecret.includes("default") || refreshSecret.includes("default");

module.exports = {
  jwtSecret,
  refreshSecret,
  jwtExpiry,
  refreshExpiry,
  usingDefaults,
};
