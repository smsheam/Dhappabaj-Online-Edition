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

  // 3-second stage countdown tick with rising pitch
  public playCountdownTick(count: number = 3) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      const baseFreq = count === 1 ? 880 : count === 2 ? 720 : 580;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // AudioContext safeguard
    }
  }

  // Dynamic whoosh / gong transition into next stage
  public playTransitionWhoosh() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      const now = ctx.currentTime;

      // 1. Resonant bell chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25); // C6

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.6);

      // 2. Low boom swell
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(160, now);
      sub.frequency.exponentialRampToValueAtTime(75, now + 0.4);

      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      sub.connect(subGain);
      subGain.connect(this.masterGain);
      sub.start(now);
      sub.stop(now + 0.5);
    } catch {
      // AudioContext safeguard
    }
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

  // Procedural Suspense Background Music (BGM)
  private bgmGain: GainNode | null = null;
  private bgmTimer: NodeJS.Timeout | null = null;
  private isBgmPlayingState: boolean = false;
  private currentChordIndex: number = 0;

  // Chord notes for subtle mystery ambient music (Am, F, Dm, Em)
  private readonly bgmChords = [
    [110.0, 164.81, 220.0, 261.63, 329.63], // A2, E3, A3, C4, E4
    [87.31, 130.81, 174.61, 220.0, 261.63],  // F2, C3, F3, A3, C4
    [73.42, 110.0, 146.83, 220.0, 293.66],   // D2, A2, D3, A3, D4
    [82.41, 123.47, 164.81, 246.94, 329.63], // E2, B2, E3, B3, E4
  ];

  public startBackgroundMusic() {
    if (this.isBgmPlayingState) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      if (!this.bgmGain) {
        this.bgmGain = ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.12, ctx.currentTime);
        if (this.masterGain) {
          this.bgmGain.connect(this.masterGain);
        } else {
          this.bgmGain.connect(ctx.destination);
        }
      }

      this.isBgmPlayingState = true;
      this.currentChordIndex = 0;

      const playChordPulse = () => {
        if (!this.isBgmPlayingState || !this.ctx || !this.bgmGain) return;
        const now = this.ctx.currentTime;
        const chord = this.bgmChords[this.currentChordIndex % this.bgmChords.length];
        this.currentChordIndex++;

        // Soft sub-bass pad
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(chord[0], now);

        bassGain.gain.setValueAtTime(0.01, now);
        bassGain.gain.linearRampToValueAtTime(0.2, now + 0.4);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);
        bassOsc.start(now);
        bassOsc.stop(now + 2.2);

        // Gentle arpeggiated bells
        chord.slice(1).forEach((freq, idx) => {
          if (!this.ctx || !this.bgmGain) return;
          const noteTime = now + idx * 0.28;
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          noteGain.gain.setValueAtTime(0.01, noteTime);
          noteGain.gain.linearRampToValueAtTime(0.15, noteTime + 0.05);
          noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

          osc.connect(noteGain);
          noteGain.connect(this.bgmGain);
          osc.start(noteTime);
          osc.stop(noteTime + 0.6);
        });
      };

      playChordPulse();
      this.bgmTimer = setInterval(playChordPulse, 2400);
    } catch {
      // AudioContext safeguard
    }
  }

  public stopBackgroundMusic() {
    this.isBgmPlayingState = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public isBgmPlaying(): boolean {
    return this.isBgmPlayingState;
  }

  public toggleBackgroundMusic(): boolean {
    if (this.isBgmPlayingState) {
      this.stopBackgroundMusic();
      return false;
    } else {
      this.startBackgroundMusic();
      return true;
    }
  }
}

export const sound = new SoundManager();
