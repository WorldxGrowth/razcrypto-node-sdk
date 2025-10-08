/**
 * Custom SDK error for clean messages + optional code (e.g., RZ_002)
 */
class RazCryptoError extends Error {
  constructor(message, code = null) {
    super(message);
    this.name = "RazCryptoError";
    this.code = code;
  }
}

module.exports = { RazCryptoError };
