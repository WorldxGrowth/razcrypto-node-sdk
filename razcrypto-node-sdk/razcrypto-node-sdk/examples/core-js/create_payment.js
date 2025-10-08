require("dotenv").config();
const { RazCryptoClient } = require("../../src/client");

(async () => {
  try {
    const client = new RazCryptoClient(process.env.RAZ_GATEWAY_ID, process.env.RAZ_SECRET_KEY);
    const payment = await client.createPayment(10.5, {
      email: "tester@example.com",
      username: "test_user",
      callback_url: "https://yourdomain.com/raz-webhook",
      custom_data: { order_id: "ORD_" + Date.now() }
    });
    console.log("[OK] createPayment:", payment);
  } catch (e) {
    console.error("[ERR]", e.message);
  }
})();
