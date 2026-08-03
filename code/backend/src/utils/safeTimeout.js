/**
 * Node's timer APIs (setTimeout/setInterval) internally store the delay in
 * a 32-bit signed integer. Any delay greater than 2147483647ms (~24.8 days)
 * overflows that integer and Node silently clamps the delay to 1ms instead
 * of throwing, emitting a `TimeoutOverflowWarning`.
 *
 * This is easy to trigger by accident whenever a TTL expressed in seconds
 * (e.g. a "cache for a year" value) gets multiplied by 1000 and handed
 * straight to setTimeout - the callback then fires almost immediately
 * instead of after the intended delay, which silently breaks any TTL-based
 * expiry logic (as happened with the in-memory fallback stores below).
 *
 * MAX_TIMEOUT_MS is the largest delay setTimeout can be trusted with.
 */
const MAX_TIMEOUT_MS = 2147483647; // 2^31 - 1

/**
 * Schedule `callback` after `delayMs`, clamping to the maximum safe
 * setTimeout delay so long TTLs (e.g. one year) don't overflow and fire
 * almost instantly.
 *
 * @param {Function} callback
 * @param {number} delayMs
 * @returns {NodeJS.Timeout}
 */
function safeSetTimeout(callback, delayMs) {
  const safeDelay = Math.min(Math.max(delayMs, 0), MAX_TIMEOUT_MS);
  return setTimeout(callback, safeDelay);
}

module.exports = { safeSetTimeout, MAX_TIMEOUT_MS };
