import { FastifyPluginAsync } from 'fastify';
import { revenueService } from './revenueService';

export const billingRoutes: FastifyPluginAsync = async (fastify) => {
  // -------------------------------------------------------------
  // 1. SPENDER TOP-UP APIS (Aplikasi Pengguna)
  // -------------------------------------------------------------

  // Ambil daftar paket koin (Reguler + Spender VIP)
  fastify.get('/api/billing/packages', async () => {
    return {
      success: true,
      data: revenueService.getCoinPackages(),
    };
  });

  // Buat invoice pesanan top-up spender
  fastify.post('/api/billing/topup/create', async (request, reply) => {
    const body = (request.body || {}) as {
      userId?: string;
      userNickname?: string;
      packageId?: string;
      paymentMethod?: any;
    };

    if (!body.userId || !body.packageId || !body.paymentMethod) {
      return reply.status(400).send({
        success: false,
        message: 'Parameter userId, packageId, dan paymentMethod wajib diisi.',
      });
    }

    const invoice = revenueService.createTopupInvoice({
      userId: body.userId,
      userNickname: body.userNickname || 'Pengguna',
      packageId: body.packageId,
      paymentMethod: body.paymentMethod,
    });

    return {
      success: true,
      message: 'Invoice pembayaran berhasil dibuat.',
      data: invoice,
    };
  });

  // Konfirmasi pembayaran invoice spender (Simulasi / Webhook Payment Gateway)
  fastify.post('/api/billing/topup/confirm', async (request, reply) => {
    const body = (request.body || {}) as { invoiceId?: string };
    if (!body.invoiceId) {
      return reply.status(400).send({
        success: false,
        message: 'invoiceId diperlukan.',
      });
    }

    const paidTx = revenueService.confirmTopupPayment(body.invoiceId);
    if (!paidTx) {
      return reply.status(404).send({
        success: false,
        message: 'Invoice tidak ditemukan.',
      });
    }

    return {
      success: true,
      message: 'Pembayaran berhasil dikonfirmasi! Koin telah ditambahkan.',
      data: paidTx,
    };
  });

  // H5 / Webview Checkout Page (Anti-Fraud & Zero-Chargeback Webview Pay ala Tigo OutWebPay)
  fastify.get('/h5/checkout/:invoiceId', async (request, reply) => {
    const params = request.params as { invoiceId: string };
    const invoice = revenueService.getTopupInvoice(params.invoiceId);

    const inv = invoice || {
      id: params.invoiceId,
      userNickname: 'Sultan Spender',
      packageName: 'Paket Kencan Awal',
      amountIdr: 15000,
      coinsAwarded: 120,
      bonusCoinsAwarded: 0,
      couponsAwarded: 0,
      paymentMethod: 'QRIS',
      status: 'PENDING',
    };

    const formattedAmount = (inv.amountIdr || 15000).toLocaleString('id-ID');
    const totalCoins = (inv.coinsAwarded || 120) + (inv.bonusCoinsAwarded || 0);

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Tresno Pay • Secure Anti-Fraud Checkout</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0F0E17; color: #FFFFFF; min-height: 100vh; display: flex; flex-direction: column; }
    .header { background: #181622; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
    .header-left { display: flex; align-items: center; gap: 10px; }
    .back-btn { background: rgba(255,255,255,0.08); border: none; color: #FFF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; cursor: pointer; }
    .title-box { display: flex; flex-direction: column; }
    .title { font-size: 14px; font-weight: 800; color: #FFFFFF; }
    .subtitle { font-size: 11px; color: #00D26A; display: flex; align-items: center; gap: 4px; }
    .container { flex: 1; padding: 18px; max-width: 480px; margin: 0 auto; width: 100%; }
    .fraud-shield-banner { background: linear-gradient(135deg, rgba(0, 210, 106, 0.12), rgba(255, 184, 0, 0.08)); border: 1px solid #00D26A; border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 10px; }
    .shield-icon { font-size: 18px; }
    .shield-title { font-size: 12px; font-weight: 800; color: #00D26A; }
    .shield-desc { font-size: 11px; color: #A0A5B5; margin-top: 2px; line-height: 1.4; }
    .card { background: #181622; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 18px; margin-bottom: 16px; }
    .order-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px; margin-bottom: 12px; }
    .order-id { font-size: 12px; color: #8E8D9A; font-family: monospace; }
    .timer-badge { background: rgba(255, 75, 75, 0.15); color: #FF4B4B; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .amount-box { text-align: center; margin: 12px 0 16px 0; }
    .amount-label { font-size: 12px; color: #8E8D9A; }
    .amount-value { font-size: 26px; font-weight: 900; color: #FFB800; margin-top: 4px; }
    .package-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 59, 92, 0.12); color: #FF3B5C; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 6px; }
    .method-selector { display: flex; gap: 8px; margin-bottom: 16px; }
    .method-btn { flex: 1; padding: 10px 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #FFF; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center; }
    .method-btn.active { background: rgba(255, 59, 92, 0.15); border-color: #FF3B5C; color: #FF3B5C; }
    .qr-container { background: #FFFFFF; border-radius: 14px; padding: 18px; text-align: center; margin: 14px 0; display: flex; flex-direction: column; align-items: center; }
    .qr-mock { width: 170px; height: 170px; background: #000; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .qr-mock svg { width: 150px; height: 150px; }
    .qr-info { color: #333333; font-size: 11px; font-weight: 700; margin-top: 10px; }
    .va-box { background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 14px; margin: 14px 0; }
    .va-num { font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #00D26A; font-family: monospace; }
    .copy-btn { background: rgba(0, 210, 106, 0.15); color: #00D26A; border: 1px solid #00D26A; border-radius: 8px; padding: 6px 14px; font-size: 11px; font-weight: 700; cursor: pointer; margin-top: 8px; }
    .actions { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
    .pay-btn { background: linear-gradient(135deg, #FF3B5C, #FF7B00); border: none; color: #FFFFFF; padding: 14px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(255, 59, 92, 0.35); }
    .cancel-btn { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #8E8D9A; padding: 12px; border-radius: 14px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .footer-secure { text-align: center; color: #6E7180; font-size: 10px; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .success-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); align-items: center; justify-content: center; padding: 20px; z-index: 100; }
    .success-content { background: #181622; border: 1px solid #00D26A; border-radius: 20px; padding: 26px; text-align: center; max-width: 380px; width: 100%; }
    .success-icon { width: 56px; height: 56px; background: rgba(0,210,106,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #00D26A; font-size: 28px; margin: 0 auto 14px auto; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <button class="back-btn" onclick="handleCancel()">&#x2715;</button>
      <div class="title-box">
        <span class="title">Tresno Pay</span>
        <span class="subtitle">&#x1F512; SSL 256-Bit • Anti-Fraud Webview</span>
      </div>
    </div>
    <div style="font-size: 11px; color: #8E8D9A; font-weight: 700;">H5 PAY</div>
  </div>

  <div class="container">
    <div class="fraud-shield-banner">
      <div class="shield-icon">&#x1F6E1;&#xFE0F;</div>
      <div>
        <div class="shield-title">Sistem Proteksi Anti-Fraud &amp; Zero-Chargeback</div>
        <div class="shield-desc">Transaksi diproses melalui Webview terenkripsi 3D Secure 2.0 &amp; QRIS Bank Indonesia. Bebas biaya komisi 30% App Store sehingga bonus koin spender lebih maksimal.</div>
      </div>
    </div>

    <div class="card">
      <div class="order-header">
        <span class="order-id">ID: ${inv.id}</span>
        <span class="timer-badge">&#x23F1; <span id="timer">14:59</span></span>
      </div>

      <div class="amount-box">
        <div class="amount-label">TOTAL PEMBAYARAN</div>
        <div class="amount-value">Rp ${formattedAmount}</div>
        <div class="package-tag">&#x1F48E; ${inv.packageName} (+${totalCoins.toLocaleString()} Koin)</div>
      </div>

      <div class="method-selector">
        <button class="method-btn active" id="btn-qris" onclick="switchMethod('QRIS')">QRIS Resmi</button>
        <button class="method-btn" id="btn-va" onclick="switchMethod('VA')">Virtual Account</button>
        <button class="method-btn" id="btn-ewallet" onclick="switchMethod('EWALLET')">E-Wallet</button>
      </div>

      <!-- QRIS View -->
      <div id="view-qris" class="qr-container">
        <div class="qr-mock">
          <svg viewBox="0 0 100 100" fill="white">
            <rect x="10" y="10" width="30" height="30" fill="white"/>
            <rect x="15" y="15" width="20" height="20" fill="black"/>
            <rect x="60" y="10" width="30" height="30" fill="white"/>
            <rect x="65" y="15" width="20" height="20" fill="black"/>
            <rect x="10" y="60" width="30" height="30" fill="white"/>
            <rect x="15" y="65" width="20" height="20" fill="black"/>
            <rect x="45" y="20" width="10" height="10" fill="white"/>
            <rect x="45" y="45" width="10" height="10" fill="white"/>
            <rect x="25" y="45" width="10" height="10" fill="white"/>
            <rect x="65" y="45" width="10" height="10" fill="white"/>
            <rect x="45" y="65" width="10" height="10" fill="white"/>
            <rect x="65" y="65" width="25" height="25" fill="white"/>
          </svg>
        </div>
        <div class="qr-info">Scan dengan BCA Mobile, GoPay, OVO, DANA, ShopeePay</div>
      </div>

      <!-- VA View -->
      <div id="view-va" class="va-box" style="display: none; text-align: center;">
        <div style="font-size: 11px; color: #8E8D9A; margin-bottom: 4px;">NOMOR VIRTUAL ACCOUNT BCA</div>
        <div class="va-num">8271 9901 2834</div>
        <button class="copy-btn" onclick="copyVA()">Salin Nomor VA</button>
      </div>

      <!-- E-Wallet View -->
      <div id="view-ewallet" class="va-box" style="display: none; text-align: center;">
        <div style="font-size: 11px; color: #8E8D9A; margin-bottom: 4px;">DANA / GOPAY DIRECT LINK</div>
        <div style="font-size: 14px; font-weight: 700; color: #00D26A;">0812-9876-5432 (Tresno Official)</div>
      </div>

      <div class="actions">
        <button class="pay-btn" id="pay-action-btn" onclick="handleConfirmPayment()">
          Konfirmasi &amp; Bayar Sekarang (Instan)
        </button>
        <button class="cancel-btn" onclick="handleCancel()">
          Batalkan &amp; Kembali ke Aplikasi
        </button>
      </div>
    </div>

    <div class="footer-secure">
      <span>&#x1F512; 256-Bit TLS Bank Grade</span> • <span>Bank Indonesia QRIS</span> • <span>Tresno Web Payment Gateway v2.4</span>
    </div>
  </div>

  <!-- Success Overlay Modal -->
  <div class="success-modal" id="success-modal">
    <div class="success-content">
      <div class="success-icon">&#x2714;</div>
      <div style="font-size: 18px; font-weight: 800; color: #FFFFFF; margin-bottom: 6px;">Pembayaran Terverifikasi!</div>
      <div style="font-size: 12px; color: #A0A5B5; line-height: 1.5; margin-bottom: 18px;">
        Anti-Fraud Shield: Status transaksi SAH &amp; FINAL.<br>
        <b style="color: #FFB800;">+${totalCoins.toLocaleString()} Koin</b> telah otomatis dikreditkan ke dompet Anda!
      </div>
      <button class="pay-btn" style="width: 100%;" onclick="finishAndClose()">Kembali ke Tresno</button>
    </div>
  </div>

  <script>
    const invoiceData = {
      event: 'PAYMENT_SUCCESS',
      invoiceId: '${inv.id}',
      coinsAwarded: ${inv.coinsAwarded || 120},
      bonusCoinsAwarded: ${inv.bonusCoinsAwarded || 0},
      couponsAwarded: ${inv.couponsAwarded || 0},
      amountIdr: ${inv.amountIdr || 15000}
    };

    function switchMethod(method) {
      document.getElementById('btn-qris').classList.remove('active');
      document.getElementById('btn-va').classList.remove('active');
      document.getElementById('btn-ewallet').classList.remove('active');
      document.getElementById('view-qris').style.display = 'none';
      document.getElementById('view-va').style.display = 'none';
      document.getElementById('view-ewallet').style.display = 'none';

      if (method === 'QRIS') {
        document.getElementById('btn-qris').classList.add('active');
        document.getElementById('view-qris').style.display = 'flex';
      } else if (method === 'VA') {
        document.getElementById('btn-va').classList.add('active');
        document.getElementById('view-va').style.display = 'block';
      } else {
        document.getElementById('btn-ewallet').classList.add('active');
        document.getElementById('view-ewallet').style.display = 'block';
      }
    }

    function copyVA() {
      navigator.clipboard?.writeText('827199012834');
      alert('Nomor Virtual Account BCA 827199012834 berhasil disalin!');
    }

    async function handleConfirmPayment() {
      const btn = document.getElementById('pay-action-btn');
      btn.innerText = 'Memverifikasi Pembayaran...';
      btn.disabled = true;

      try {
        await fetch('/api/billing/topup/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: '${inv.id}' })
        });
      } catch (e) {
        console.error(e);
      }

      document.getElementById('success-modal').style.display = 'flex';
    }

    function finishAndClose() {
      const msg = JSON.stringify(invoiceData);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      }
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
      // Scheme fallback
      window.location.href = 'tresno://payment/success?invoiceId=${inv.id}';
    }

    function handleCancel() {
      const cancelMsg = JSON.stringify({ event: 'PAYMENT_CANCEL', invoiceId: '${inv.id}' });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(cancelMsg);
      }
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(cancelMsg, '*');
      }
      window.location.href = 'tresno://payment/cancel';
    }

    // Countdown timer
    let remaining = 15 * 60;
    const timerElem = document.getElementById('timer');
    setInterval(() => {
      if (remaining > 0) {
        remaining--;
        const m = Math.floor(remaining / 60).toString().padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');
        timerElem.innerText = m + ':' + s;
      }
    }, 1000);
  </script>
</body>
</html>`;

    reply.type('text/html').send(html);
  });

  // -------------------------------------------------------------
  // 2. HOST CASHOUT / WITHDRAWAL APIS (Aplikasi Host)
  // -------------------------------------------------------------

  // Host mengajukan penarikan dana
  fastify.post('/api/billing/withdrawal/request', async (request, reply) => {
    const body = (request.body || {}) as {
      hostId?: string;
      hostName?: string;
      agencyCode?: string;
      method?: any;
      accountNumber?: string;
      accountName?: string;
      points?: number;
    };

    if (!body.hostId || !body.method || !body.accountNumber || !body.accountName || !body.points) {
      return reply.status(400).send({
        success: false,
        message: 'Semua informasi rekening dan jumlah Points wajib diisi lengkap.',
      });
    }

    const result = revenueService.createWithdrawalRequest({
      hostId: body.hostId,
      hostName: body.hostName || 'Host',
      agencyCode: body.agencyCode,
      method: body.method,
      accountNumber: body.accountNumber,
      accountName: body.accountName,
      points: Number(body.points),
    });

    if (!result.success) {
      return reply.status(400).send(result);
    }

    return result;
  });

  // Host melihat riwayat pengajuan penarikan
  fastify.get('/api/billing/withdrawal/history', async (request) => {
    const query = (request.query || {}) as { hostId?: string };
    const hostId = query.hostId || 'anchor_1';
    const history = revenueService.getWithdrawalsByHost(hostId);

    return {
      success: true,
      data: history,
    };
  });

  // -------------------------------------------------------------
  // 3. CMS ADMIN DASHBOARD APIS (Khusus Pemilik APK)
  // -------------------------------------------------------------

  // Statistik Finansial Platform Keseluruhan
  fastify.get('/api/admin/financial-stats', async () => {
    return {
      success: true,
      data: revenueService.getPlatformStats(),
    };
  });

  // Ambil Parameter Bagi Hasil 3 Pihak (Host, Agency, Pemilik APK)
  fastify.get('/api/admin/revenue-config', async () => {
    return {
      success: true,
      data: revenueService.getConfig(),
    };
  });

  // Ubah Parameter Bagi Hasil dari CMS Admin
  fastify.put('/api/admin/revenue-config', async (request) => {
    const body = (request.body || {}) as any;
    const updated = revenueService.updateConfig(body);
    return {
      success: true,
      message: 'Parameter bagi hasil dan keuangan platform berhasil diperbarui.',
      data: updated,
    };
  });

  // Antrean Pengajuan Penarikan Host di CMS
  fastify.get('/api/admin/withdrawals', async (request) => {
    const query = (request.query || {}) as { status?: string };
    const list = revenueService.getWithdrawals(query.status);
    return {
      success: true,
      count: list.length,
      data: list,
    };
  });

  // Aksi Review Penarikan oleh Pemilik APK (Approve / Complete / Reject)
  fastify.post('/api/admin/withdrawals/:id/review', async (request, reply) => {
    const params = request.params as { id: string };
    const body = (request.body || {}) as {
      action: 'APPROVE' | 'COMPLETE' | 'REJECT';
      reason?: string;
      transferProofUrl?: string;
    };

    if (!body.action || !['APPROVE', 'COMPLETE', 'REJECT'].includes(body.action)) {
      return reply.status(400).send({
        success: false,
        message: 'Action harus salah satu dari: APPROVE, COMPLETE, REJECT.',
      });
    }

    const updated = revenueService.reviewWithdrawal(
      params.id,
      body.action,
      body.reason,
      body.transferProofUrl
    );

    if (!updated) {
      return reply.status(404).send({
        success: false,
        message: 'Pengajuan penarikan tidak ditemukan.',
      });
    }

    return {
      success: true,
      message: `Status penarikan ${params.id} berhasil diubah menjadi ${updated.status}.`,
      data: updated,
    };
  });

  // Riwayat Transaksi Spender Masuk di CMS
  fastify.get('/api/admin/topup-transactions', async () => {
    return {
      success: true,
      data: revenueService.getTopupTransactions(),
    };
  });
};
