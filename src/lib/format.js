/**
 * Format a number as a Swiss-franc display string (no currency symbol).
 * Uses apostrophe as thousands separator, no decimals.
 * @param {number} n
 * @returns {string}
 */
export function fmtChf(n) {
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}
