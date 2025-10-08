/**
 * Tiny helpers
 */
function safeGet(obj, key, def = null) {
  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : def;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

module.exports = { safeGet, clamp };
