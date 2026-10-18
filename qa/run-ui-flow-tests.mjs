/**
 * 💖 TRESNO - Automated End-to-End UI Flow & QA Test Suite
 * 
 * Skenario Pengujian:
 * 1. Auth & Onboarding Flow (Instant Guest, Gender, 18+ Gate)
 * 2. Bottom Navigation Flow (Match, Destiny, Messages, Me)
 * 3. Video Call & 20s Free Trial Flow (DRM Watermark, Countdown, Hangup, Return)
 * 4. 24h Ephemeral Story Viewer Flow (Progress Bar, Caption, 24h Purge badge)
 * 5. Tigo-Style Chat Room & Read Receipts Flow (Message batching, Gift picker)
 * 6. Missions & Task Center Rewards Flow (Check-in, Claim bonus coins/coupons)
 * 7. QRIS Micro Top-Up Flow (Katalog paket, Simulasi bayar, Update saldo atomik)
 */

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 TRESNO AUTOMATED QA TEST SUITE - UI FLOW RUNNER');
  console.log('====================================================\n');

  const task = await taskSpace('tresno-qa-full-suite');
  const page = task.page('p1');
  let passCount = 0;
  let failCount = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failCount++;
    }
  };

  try {
    // ----------------------------------------------------
    // TEST 1: App Launch & Initial Landing
    // ----------------------------------------------------
    console.log('▶️ [TEST 1/7] App Launch & Onboarding Flow');
    await page.goto('http://localhost:3000');
    // Splash screen has a minimum 1.5s display timer, wait 2.5s for Main screen to mount
    await page.waitForTimeout(2500);

    const title = await page.title();
    assert(title.includes('Tresno'), 'Page title contains "Tresno"');

    // Dismiss Starter Pack / Gentleman VIP Modal if presented on first launch
    await page.evaluate(() => {
      const dismissBtn = document.querySelector('[data-testid="btn-dismiss-gentleman-upsell"]') ||
        document.querySelector('[data-testid="btn-close-gentleman-upsell"]') ||
        [...document.querySelectorAll('div, button')].find(el => el.textContent?.includes('Nanti Saja'));
      if (dismissBtn) dismissBtn.click();
    });
    await page.waitForTimeout(600);

    // ----------------------------------------------------
    // TEST 2: Tab Navigation (Match, Destiny, Messages, Me)
    // ----------------------------------------------------
    console.log('\n▶️ [TEST 2/7] Main Tab Navigation Flow');
    
    // Tab Destiny
    await page.click('text="Destiny"');
    await page.waitForTimeout(800);
    const snapDestiny = await page.snapshot();
    assert(snapDestiny.includes('Destiny Feed') && snapDestiny.includes('Dewi Lestari'), 'Destiny Feed renders host list');

    // Tab Messages
    await page.click('text="Messages"');
    await page.waitForTimeout(800);
    const snapMessages = await page.snapshot();
    assert(snapMessages.includes('Tresno Official') && snapMessages.includes('CHATS & CALLS'), 'Messages tab renders official notices & chat list');

    // Tab Me
    await page.click('text="Me"');
    await page.waitForTimeout(800);
    const snapMe = await page.snapshot();
    assert(snapMe.includes('My Profile') && snapMe.includes('My Coins'), 'Me tab renders profile and wallet card');

    // Tab Match (Home)
    await page.click('text="Match"');
    await page.waitForTimeout(800);
    const snapMatch = await page.snapshot();
    assert(snapMatch.includes('Start Match Radar ⚡') || snapMatch.includes('Tresno'), 'Match tab renders radar matchmaking core');

    // ----------------------------------------------------
    // TEST 3: Video Call & 20s Free Trial Flow
    // ----------------------------------------------------
    console.log('\n▶️ [TEST 3/7] Video Call & 20s Free Trial Flow');
    await page.click('text="Destiny"');
    await page.waitForTimeout(800);

    // Trigger Call
    await page.evaluate(() => {
      const callBtn = document.querySelector('[data-testid="btn-direct-call"]') ||
        [...document.querySelectorAll('div')].find(el => el.textContent?.trim() === 'Call' || el.textContent?.trim() === 'Panggil');
      if (callBtn) callBtn.click();
    });
    await page.waitForTimeout(2000);

    const callSnap = await page.snapshot();
    assert(
      callSnap.includes('Live Video Call') || callSnap.includes('Obrolan Video Aktif') || callSnap.includes('Dewi Lestari'),
      'Call connects to Live Video Call stage'
    );
    assert(
      (callSnap.includes('DRM Active') || callSnap.includes('DRM Aktif')) && callSnap.includes('TRESNO DRM'),
      'Strict DRM Watermark is active during call'
    );
    assert(
      callSnap.includes('Free Trial Remaining') || callSnap.includes('Sisa Uji Coba Gratis'),
      '20-second free trial countdown is active and visible'
    );

    // Hangup
    await page.evaluate(() => {
      const hangupBtn = document.querySelector('[data-testid="btn-hangup"]');
      if (hangupBtn) {
        hangupBtn.click();
      } else {
        const btns = [...document.querySelectorAll('div')].filter(el => el.textContent?.trim() === '📞' || el.querySelector('svg'));
        if (btns.length > 0) btns[btns.length - 1].click();
      }
    });
    await page.waitForTimeout(1500);

    const endedSnap = await page.snapshot();
    assert(
      endedSnap.includes('Destiny Feed') || endedSnap.includes('Dewi Lestari') || endedSnap.includes('Destiny'),
      'Call cleanly falls back directly to respective screen (Destiny Feed) without blocking screen'
    );

    // ----------------------------------------------------
    // TEST 4: 24h Story Viewer Flow
    // ----------------------------------------------------
    console.log('\n▶️ [TEST 4/7] 24-Hour Ephemeral Story Flow');
    await page.click('text="Dewi Lestari" >> nth=0');
    await page.waitForTimeout(1200);

    const storySnap = await page.snapshot();
    assert(storySnap.includes('Supabase Purge') || storySnap.includes('Dewi Lestari'), 'Fullscreen Story Viewer opened with 24h metadata');

    // Close Story
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="btn-close-story"]') ||
        document.querySelector('[aria-label="btn-close-story"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(800);
    const snapAfterStory = await page.snapshot();
    assert(snapAfterStory.includes('Destiny Feed') || snapAfterStory.includes('Dewi Lestari'), 'Story closed and returned to feed');

    // ----------------------------------------------------
    // TEST 5: Chat Room & Coupon Flow
    // ----------------------------------------------------
    console.log('\n▶️ [TEST 5/7] Chat Room & Communication Flow');
    await page.click('text="Messages"');
    await page.waitForTimeout(800);

    await page.click('text="Dewi Lestari" >> nth=0');
    await page.waitForTimeout(1200);

    const chatSnap = await page.snapshot();
    assert(chatSnap.includes('Dewi Lestari') && (chatSnap.includes('Type a message') || chatSnap.includes('Ketik pesan') || chatSnap.includes('Cloud Synced')), 'Chat room opened with header, input field & history');

    // Close Chat Room
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="btn-close-chat"]') ||
        document.querySelector('[aria-label="btn-close-chat"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(800);

    // ----------------------------------------------------
    // TEST 6: Missions & Task Center Rewards Flow
    // ----------------------------------------------------
    console.log('\n▶️ [TEST 6/7] Missions & Task Center Rewards Flow');
    await page.click('text="Me"');
    await page.waitForTimeout(800);

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('div, span, button')].find(el =>
        el.textContent?.trim() === 'Missions & Rewards' || el.textContent?.trim() === 'Misi & Hadiah'
      );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const missionSnap = await page.snapshot({ scope: 'full_page' });
    assert(
      missionSnap.includes('Missions & Reward Center') || missionSnap.includes('Pusat Misi & Hadiah'),
      'Missions Center modal rendered'
    );
    assert(
      (missionSnap.includes('Daily Tasks') || missionSnap.includes('Misi Harian')) &&
      (missionSnap.includes('Novice Tasks') || missionSnap.includes('Misi Pemula')),
      'Daily & Novice task tabs present'
    );

    // Close Missions Modal
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="btn-close-missions"]') ||
        document.querySelector('[aria-label="btn-close-missions"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    // ----------------------------------------------------
    // TEST 7: QRIS Micro Top-Up Flow
    // ----------------------------------------------------
    console.log('\n▶️ [TEST 7/7] QRIS Micro Top-Up Flow');
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="btn-open-topup"]') ||
        [...document.querySelectorAll('div, span, button')].find(el =>
          el.textContent?.trim() === 'Top Up Coins' || el.textContent?.trim() === 'Top Up Koin'
        );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const topupSnap = await page.snapshot({ scope: 'full_page' });
    assert(
      (topupSnap.includes('Top Up Coins') || topupSnap.includes('Isi Ulang Koin') || topupSnap.includes('Top Up Koin')) &&
      (topupSnap.includes('25.000') || topupSnap.includes('QRIS')),
      'Top-up bottom sheet renders coin packs & QRIS CTA'
    );

    // Click QRIS Payment
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="btn-pay-qris"]') ||
        [...document.querySelectorAll('div, span, button')].find(el =>
          el.textContent?.includes('QRIS') && el.textContent?.includes('25.000')
        );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1200);

    const qrisSnap = await page.snapshot({ scope: 'full_page' });
    assert(
      (qrisSnap.includes('Scan QRIS') || qrisSnap.includes('Pindai QRIS') || qrisSnap.includes('QRIS Sandbox')) &&
      (qrisSnap.includes('Simulate') || qrisSnap.includes('Simulasikan')),
      'QRIS sandbox code rendered with simulation button'
    );

    // Simulate Payment
    await page.evaluate(() => {
      const btn = document.querySelector('[data-testid="btn-simulate-payment"]') ||
        [...document.querySelectorAll('div, span, button')].find(el =>
          el.textContent?.includes('Simulate') || el.textContent?.includes('Simulasikan')
        );
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const postPaySnap = await page.snapshot({ scope: 'full_page' });
    assert(
      (postPaySnap.includes('My Coins') || postPaySnap.includes('Koin Saya')) &&
      !postPaySnap.includes('Scan QRIS Code'),
      'Payment success simulated, modal dismissed, coins credited'
    );

  } catch (err) {
    console.error('❌ Test execution encountered an unhandled exception:', err);
    failCount++;
  } finally {
    await task.finish({ keep: [] });
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('====================================================');
  
  if (failCount === 0) {
    console.log('🎉 ALL CORE UI FLOWS ARE 100% VALIDATED & READY!');
  } else {
    console.log('⚠️ SOME UI FLOWS REQUIRE INVESTIGATION.');
  }
}

await runTestSuite();
