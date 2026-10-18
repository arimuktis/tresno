/**
 * SoundService - Web Audio API Synthesizer & Notification Sound Engine
 *
 * Provides studio-quality synthesized notification sounds & phone ringtones
 * with zero external mp3/wav asset dependencies, zero network latency,
 * and 100% offline-first reliability.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private soundEnabled: boolean = true;
  private activeRingtoneTimer: any = null;
  private activeRingtoneGainNodes: GainNode[] = [];

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      try {
        this.ctx = new AudioCtx();
      } catch (err) {
        console.warn('[SoundService] Could not initialize AudioContext:', err);
      }
    }

    // Auto-unlock AudioContext on first touch / click
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopIncomingCallRingtone();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * 1. INCOMING CALL RINGTONE (Melodic Pentatonic Loop)
   * Plays a pleasant harmonic ringtone sequence that loops until stopped.
   */
  public playIncomingCallRingtone(): { stop: () => void } {
    this.stopIncomingCallRingtone();
    if (!this.soundEnabled) return { stop: () => {} };

    const ctx = this.ensureContext();
    if (!ctx) return { stop: () => {} };

    // Haptic vibration pattern for mobile browsers
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([350, 150, 350, 150, 350, 600]);
      } catch (_) {}
    }

    const notes = [
      { freq: 523.25, time: 0, dur: 0.18 },    // C5
      { freq: 659.25, time: 0.18, dur: 0.18 }, // E5
      { freq: 783.99, time: 0.36, dur: 0.22 }, // G5
      { freq: 880.00, time: 0.60, dur: 0.22 }, // A5
      { freq: 1046.50, time: 0.85, dur: 0.38 },// C6
      { freq: 783.99, time: 1.25, dur: 0.20 }, // G5
      { freq: 880.00, time: 1.48, dur: 0.45 }, // A5
    ];

    const playCycle = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;
      const now = this.ctx.currentTime;

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const osc2 = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        // Harmonic overtone for warmth
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(n.freq * 2, now + n.time);

        gain.gain.setValueAtTime(0, now + n.time);
        gain.gain.linearRampToValueAtTime(0.24, now + n.time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + n.time);
        osc2.start(now + n.time);
        osc.stop(now + n.time + n.dur + 0.05);
        osc2.stop(now + n.time + n.dur + 0.05);

        this.activeRingtoneGainNodes.push(gain);
      });

      // Repeat haptics
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([350, 150, 350, 150, 350, 600]);
        } catch (_) {}
      }
    };

    playCycle();
    this.activeRingtoneTimer = setInterval(playCycle, 2400);

    return {
      stop: () => this.stopIncomingCallRingtone(),
    };
  }

  public stopIncomingCallRingtone() {
    if (this.activeRingtoneTimer) {
      clearInterval(this.activeRingtoneTimer);
      this.activeRingtoneTimer = null;
    }
    this.activeRingtoneGainNodes.forEach((g) => {
      try {
        g.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
      } catch (_) {}
    });
    this.activeRingtoneGainNodes = [];

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch (_) {}
    }
  }

  /**
   * 2. CHAT MESSAGE CHIME (Modern Glass Bubble Ping)
   */
  public playMessageChime() {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch (_) {}
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, now); // B6 overtone
    osc2.frequency.exponentialRampToValueAtTime(2637.02, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  /**
   * 3. GIFT / REWARD / COIN CHIME (Ascending Sparkling Arpeggio)
   */
  public playGiftChime() {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([60, 40, 80, 40, 120]);
      } catch (_) {}
    }

    const now = ctx.currentTime;
    const notes = [739.99, 932.33, 1108.73, 1479.98]; // F#5, A#5, C#6, F#6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  }

  /**
   * 4. MATCH FOUND CHIME (Resonant Lock-on Ping)
   */
  public playMatchFoundChime() {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 200]);
      } catch (_) {}
    }

    const now = ctx.currentTime;

    // Bass punch
    const oscBass = ctx.createOscillator();
    const gainBass = ctx.createGain();
    oscBass.type = 'sine';
    oscBass.frequency.setValueAtTime(140, now);
    oscBass.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gainBass.gain.setValueAtTime(0.3, now);
    gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    oscBass.connect(gainBass);
    gainBass.connect(ctx.destination);
    oscBass.start(now);
    oscBass.stop(now + 0.22);

    // High triumphant bell
    const oscBell = ctx.createOscillator();
    const gainBell = ctx.createGain();
    oscBell.type = 'sine';
    oscBell.frequency.setValueAtTime(880, now + 0.08);
    oscBell.frequency.exponentialRampToValueAtTime(1760, now + 0.18);

    gainBell.gain.setValueAtTime(0, now + 0.08);
    gainBell.gain.linearRampToValueAtTime(0.28, now + 0.1);
    gainBell.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    oscBell.connect(gainBell);
    gainBell.connect(ctx.destination);
    oscBell.start(now + 0.08);
    oscBell.stop(now + 0.52);
  }

  /**
   * 5. SYSTEM PROMO / ANNOUNCEMENT CHIME
   */
  public playPromoChime() {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  /**
   * 6. COIN DROP / POINTS REWARD CHIME
   */
  public playCoinSound() {
    this.playGiftChime();
  }
}

export const soundService = new SoundService();
