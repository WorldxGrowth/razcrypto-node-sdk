/**
 * SDK Custom Payment Page (HTML)
 * - Responsive, mobile-first
 * - Shows: Amount, Currency/Chain, Wallet Address (copy), QR
 * - Polls status every 5s → success overlay
 * - Branding via logo_url + primary_color (env or param)
 */
class PaymentPage {
  static render(apiJson, brand = {}) {
    const logo = brand.logo_url || process.env.RAZ_LOGO_URL || "";
    const prim = brand.primary_color || process.env.RAZ_PRIMARY_COLOR || "#4f46e5";

    const pid     = String(apiJson.payment_id || "");
    const qr      = String(apiJson.qr_url || "");
    const amount  = String(apiJson.amount || "");
    const address = String(apiJson.wallet_address || "");
    const curr    = String(apiJson.currency || "USDT");
    const chain   = String(apiJson.chain || "BSC");

    const expiry  = Math.max(1, Math.min(60, Number(apiJson.expiry_minutes || 30)));
    const seconds = expiry * 60;

    const statusUrl = apiJson.payment_url
      ? String(apiJson.payment_url).replace(`/pay/${pid}`, `/api/v1/payments/status/${pid}`)
      : "";

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Pay | RazCrypto</title>
<style>
  :root{--primary:${prim};--bg:#f7f8fb;--ink:#111827;--muted:#6b7280;--border:#e5e7eb;--ok:#10b981}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial}
  .wrap{max-width:720px;margin:16px auto;padding:12px}
  .card{background:#fff;border:1px solid var(--border);border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,.06);overflow:hidden}
  .head{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--border)}
  .head img{height:34px}
  .badge{margin-left:auto;background:var(--primary);color:#fff;border-radius:9999px;padding:6px 10px;font-size:12px}
  .main{padding:16px;display:grid;gap:14px}
  .panel{border:1px dashed var(--border);border-radius:12px;padding:12px;background:#fafbff}
  .row{display:flex;align-items:center;gap:8px}
  .val{font-weight:700;word-break:break-all}
  .copy{margin-left:auto;font-size:12px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;background:#fff;cursor:pointer}
  .qr{text-align:center}
  .qr img{width:240px;height:240px;border:1px solid var(--border);border-radius:12px;background:#fff}
  #overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:1000}
  #overlay .card2{background:#fff;padding:24px;border-radius:16px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.3)}
  .hint{font-size:12px;color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="head">
      <img src="${logo}" alt="Logo" onerror="this.style.display='none'">
      <div><strong>Complete Your Payment</strong></div>
      <span class="badge" id="timer">--:--</span>
    </div>

    <div class="main">
      <div class="panel">
        <div class="row">
          <div class="val">${amount} ${curr} (${chain})</div>
          <button class="copy" data-copy="${amount}" onclick="copyText(this)">Copy</button>
        </div>
      </div>

      <div class="panel">
        <div class="row">
          <div class="val">${address}</div>
          <button class="copy" data-copy="${address}" onclick="copyText(this)">Copy</button>
        </div>
      </div>

      <div class="panel qr"><img src="${qr}" alt="Payment QR"></div>

      <div class="hint">Scan the QR or copy the address & amount. This page auto-detects confirmation.</div>
      <div class="hint">Payment ID: <strong>${pid}</strong></div>
    </div>
  </div>
</div>

<div id="overlay"><div class="card2">✅ Payment Confirmed</div></div>

<script>
  let left = ${seconds};
  function fmt(s){ const m=Math.floor(s/60), ss=('0'+(s%60)).slice(-2); return m+':'+ss; }
  setInterval(()=>{ left=Math.max(0,left-1); document.getElementById('timer').textContent=fmt(left); }, 1000);

  function copyText(btn){
    const v = btn.getAttribute('data-copy') || '';
    navigator.clipboard.writeText(v).then(()=>{
      btn.textContent = 'Copied';
      setTimeout(()=>btn.textContent='Copy', 1200);
    });
  }

  const STATUS_URL = "${statusUrl}";
  async function poll(){
    if(!STATUS_URL){ return; }
    try {
      const res = await fetch(STATUS_URL);
      const j = await res.json();
      if(j.status === 'completed'){
        document.getElementById('overlay').style.display='flex';
        return;
      }
      if(j.status === 'expired'){
        document.getElementById('timer').textContent='Expired';
        return;
      }
    } catch(e) {}
    setTimeout(poll, 5000);
  }
  poll();
</script>
</body>
</html>`;
  }
}

module.exports = { PaymentPage };
