const axios = require("axios");
const crypto = require("crypto");
const { RazCryptoError } = require("./errors");
const { safeGet, clamp } = require("./utils");

/**
 * RazCrypto Node.js SDK - S2S client
 * - NEVER expose secret_key on frontend
 */
class RazCryptoClient {
  /**
   * @param {string} gatewayId
   * @param {string} secretKey
   * @param {string} baseUrl default https://razcryptogateway.com/api/v1
   */
  constructor(gatewayId, secretKey, baseUrl = "https://razcryptogateway.com/api/v1") {
    if (!gatewayId || !secretKey) {
      throw new RazCryptoError("Gateway credentials missing. Provide gatewayId & secretKey.");
    }
    this.gatewayId = gatewayId;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.http = axios.create({ timeout: 12000 });
  }

  /**
   * Create Payment
   * @param {number} amount >= 0.01
   * @param {object} opts { email, mobile, username, callback_url, product_id, subscription_id,
   *                        custom_data<Object>, expiry_minutes(1..60), currency, chain, return_json="true" }
   * @returns {Promise<object>}
   */
  async createPayment(amount, opts = {}) {
    if (!amount || amount <= 0) {
      throw new RazCryptoError(`Amount must be > 0.01 (got ${amount})`, "RZ_001");
    }

    const payload = Object.assign(
      {
        gateway_id: this.gatewayId,
        secret_key: this.secretKey,
        amount,
        return_json: "true"
      },
      opts
    );

    if (payload.custom_data && typeof payload.custom_data !== "object") {
      throw new RazCryptoError("custom_data must be an object (JSON).");
    }

    try {
      const res = await this.http.post(`${this.baseUrl}/payments/create`, payload, {
        headers: { "Content-Type": "application/json" }
      });
      if (safeGet(res.data, "status") !== "success") {
        throw new RazCryptoError(
          safeGet(res.data, "message", "Payment create failed"),
          safeGet(res.data, "error_code")
        );
      }
      return res.data;
    } catch (e) {
      // Standardize axios/network errors
      throw new RazCryptoError("Network/API error: " + (e.response?.data?.message || e.message));
    }
  }

  /**
   * Get Payment Status
   * @param {string} paymentId
   * @param {number} expiryMinutes (1..60)
   */
  async getStatus(paymentId, expiryMinutes = 30) {
    if (!paymentId) throw new RazCryptoError("paymentId required.");
    const m = clamp(expiryMinutes, 1, 60);
    try {
      const res = await this.http.get(`${this.baseUrl}/payments/status/${encodeURIComponent(paymentId)}?m=${m}`);
      return res.data;
    } catch (e) {
      throw new RazCryptoError("Network/API error: " + (e.response?.data?.message || e.message));
    }
  }

  /**
   * Verify webhook signature (HMAC-SHA256)
   * @param {string} rawBody raw string body
   * @param {string} receivedSig from header `x-razcrypto-signature`
   * @param {string} secret secret key
   */
  static verifyWebhook(rawBody, receivedSig, secret) {
    if (!receivedSig || !secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSig));
    } catch {
      // length mismatch fallback
      return expected === receivedSig;
    }
  }
}

module.exports = { RazCryptoClient };
