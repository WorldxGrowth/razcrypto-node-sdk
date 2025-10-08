require("dotenv").config();
const { RazCryptoClient } = require("../../src/client");
const { PaymentPage } = require("../../src/paymentPage");
const fs = require("fs");
const path = require("path");

(async () => {
  try {
    const client = new RazCryptoClient(process.env.RAZ_GATEWAY_ID, process.env.RAZ_SECRET_KEY);
    const payment = await client.createPayment(10.5, {
      email: "tester@example.com",
      username: "test_user",
      callback_url: "https://yourdomain.com/raz-webhook",
      custom_data: { order_id: "ORD_" + Date.now() }
    });

    // Render SDK page instead of hosted
    const html = PaymentPage.render(payment, {
      logo_url: process.env.RAZ_LOGO_URL,
      primary_color: process.env.RAZ_PRIMARY_COLOR
    });

    const out = path.join(process.cwd(), "custom-test.html");
    fs.writeFileSync(out, html, "utf8");
    console.log("[OK] Wrote", out);
  } catch (e) {
    console.error("[ERR]", e.message);
  }
})();
