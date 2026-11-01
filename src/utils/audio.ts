class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Master gain node with boosted level for loud, clear playback
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Tactile Mechanical Key / Typing sound
  public playKeySound() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // High click transient
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.035);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.035);

      // Low plastic bottom-out body
      const lowOsc = ctx.createOscillator();
      const lowGain = ctx.createGain();
      lowOsc.type = 'sine';
      lowOsc.frequency.setValueAtTime(180, now);
      lowOsc.frequency.exponentialRampToValueAtTime(60, now + 0.04);

      lowGain.gain.setValueAtTime(0.25, now);
      lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      lowOsc.connect(lowGain);
      lowGain.connect(this.masterGain);

      lowOsc.start(now);
      lowOsc.stop(now + 0.04);
    } catch {
      // AudioContext interaction safeguard
    }
  }

  // Crisp loud button tap / tick
  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // AudioContext safeguard
    }
  }

  // Loud card swoosh / flip sound
  public playCardFlip() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.16);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  // Terrifying, dramatic horror suspense chord when imposter is revealed
  public playSuspenseReveal() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // 1. Deep Sub-Bass Impact Boom (Earth-shaking drop)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.5);

      subGain.gain.setValueAtTime(0.7, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 1.2);

      // 2. Dissonant Horror Stinger Chords (Minor 2nd / Tritone cluster: C, C#, Eb, F#)
      const scaryFreqs = [130.81, 138.59, 155.56, 185.0, 261.63, 277.18];
      scaryFreqs.forEach((freq, idx) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Add slight vibrato/pitch bend for creepy suspense
        osc.frequency.linearRampToValueAtTime(freq * 0.96, now + 1.8);

        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch {
      // AudioContext safeguard
    }
  }

  // Loud, celebratory victory fanfare
  public playSuccessChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.45, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  // Loud punchy buzzer
  public playBuzzer() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      [130, 134].forEach((freq) => {
        if (!ctx || !this.masterGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.linearRampToValueAtTime(freq * 0.75, now + 0.35);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Timer warning tick (louder and punchier)
  public playWarningTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  public playTimerTick() {
    this.playWarningTick();
  }

  public playVoteCast() {
    this.playClick();
  }

  public playTada() {
    this.playSuccessChime();
  }

  public playVictory() {
    this.playSuccessChime();
  }
}

export const sound = new SoundManager();
