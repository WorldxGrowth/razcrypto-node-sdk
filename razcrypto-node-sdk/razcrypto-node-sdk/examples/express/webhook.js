const express = require("express");
const { RazCryptoClient } = require("../../src/client");

const webhookRouter = express.Router();

webhookRouter.post("/raz-webhook", express.json({ type: "*/*" }), (req, res) => {
  // IMPORTANT: raw body is needed for HMAC. If you can’t get raw easily with express.json,
  // ensure upstream preserves the body exactly. For demo, we re-stringify:
  const raw = JSON.stringify(req.body);
  const sig = req.headers["x-razcrypto-signature"];

  if (!RazCryptoClient.verifyWebhook(raw, sig, process.env.RAZ_SECRET_KEY)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const data = req.body;
  if (data.event === "payment.completed") {
    // TODO: idempotent credit using payment_id / tx_hash guard
    console.log("✅ payment.completed", {
      payment_id: data.payment_id,
      amount: data.amount,
      tx_hash: data.tx_hash
    });
  }

  return res.json({ status: "ok" });
});

module.exports = { webhookRouter };
