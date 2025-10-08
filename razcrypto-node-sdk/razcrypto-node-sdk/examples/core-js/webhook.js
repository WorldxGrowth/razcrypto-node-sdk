require("dotenv").config();
const crypto = require("crypto");
const https = require("https");

/**
 * This is a local sender to test your /raz-webhook endpoint by mimicking gateway.
 * Adjust WEBHOOK_URL to your endpoint URL.
 */

const WEBHOOK_URL = "https://yourdomain.com/raz-webhook";

const payload = JSON.stringify({
  event: "payment.completed",
  payment_id: "payid_demo",
  amount: 10.5,
  tx_hash: "0x_demo_hash"
});

const sig = crypto.createHmac("sha256", process.env.RAZ_SECRET_KEY).update(payload).digest("hex");

const req = https.request(WEBHOOK_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-razcrypto-signature": sig,
    "Content-Length": Buffer.byteLength(payload)
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("Response", res.statusCode, data);
  });
});

req.on("error", (err) => {
  console.error("Webhook test error:", err.message);
});

req.write(payload);
req.end();
