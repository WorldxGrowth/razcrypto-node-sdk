const express = require("express");
const { RazCryptoClient } = require("../../src/client");
const { PaymentPage } = require("../../src/paymentPage");

const router = express.Router();

/**
 * POST /deposit
 * Body: { amount, email, username, mobile? }
 */
router.post("/deposit", async (req, res) => {
  const { amount, email, username, mobile } = req.body || {};
  try {
    const client = new RazCryptoClient(process.env.RAZ_GATEWAY_ID, process.env.RAZ_SECRET_KEY);
    const payment = await client.createPayment(Number(amount), {
      email, username, mobile,
      callback_url: "https://yourdomain.com/raz-webhook",
      custom_data: { order_id: "ORD_" + Date.now(), source: "express_demo" }
    });

    // Hosted vs Custom
    if (String(process.env.RAZ_REDIRECT || "true") === "true" && payment.payment_url) {
      return res.redirect(payment.payment_url);
    }

    return res.send(PaymentPage.render(payment, {
      logo_url: process.env.RAZ_LOGO_URL,
      primary_color: process.env.RAZ_PRIMARY_COLOR
    }));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = { router };
