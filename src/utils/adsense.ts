import { sound } from './audio';

export interface AdBreakPlacementInfo {
  breakType: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  breakName: string;
  breakFormat: 'interstitial' | 'reward';
  breakStatus:
    | 'notReady'
    | 'timeout'
    | 'invalid'
    | 'error'
    | 'noAdPreloaded'
    | 'frequencyCapped'
    | 'ignored'
    | 'other'
    | 'dismissed'
    | 'viewed';
}

export interface AdBreakOptions {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (placementInfo: AdBreakPlacementInfo) => void;
  beforeReward?: (showAdFn: () => void) => void;
  adDismissed?: () => void;
  adViewed?: () => void;
}

export interface AdConfigOptions {
  preloadAdBreaks?: 'on' | 'auto';
  sound?: 'on' | 'off';
  onReady?: () => void;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    adBreak?: (o: AdBreakOptions) => void;
    adConfig?: (o: AdConfigOptions) => void;
  }
}

/**
 * Keep Google H5 Games Ad Placement sound setting synced with game mute state.
 */
export function syncAdSenseSound(isMuted: boolean): void {
  try {
    if (typeof window !== 'undefined' && typeof window.adConfig === 'function') {
      window.adConfig({
        sound: isMuted ? 'off' : 'on',
      });
    }
  } catch {
    // Ignore when AdSense script is blocked or unavailable
  }
}

/**
 * Triggers a Google AdSense H5 Games video/interstitial ad break every 3 completed rounds
 * (i.e. after Round 3, 6, 9, ...). Safely resolves even if ads are not filled, blocked,
 * or offline so gameplay never gets stuck.
 */
export function triggerThreeRoundVideoAd(completedRound: number): Promise<void> {
  if (completedRound <= 0 || completedRound % 3 !== 0) {
    return Promise.resolve();
  }

  if (typeof window === 'undefined' || typeof window.adBreak !== 'function') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    let adStarted = false;
    let wasBgmPlaying = false;
    let wasMuted = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(preAdTimeout);
      clearTimeout(hardCapTimeout);
      resolve();
    };

    // If AdSense script hasn't loaded or doesn't start an ad within 2.5s, continue game smoothly
    const preAdTimeout = setTimeout(() => {
      if (!adStarted) {
        finish();
      }
    }, 2500);

    // Absolute safety ceiling (90s) in case adBreakDone never fires
    const hardCapTimeout = setTimeout(() => {
      if (adStarted) {
        sound.setMuted(wasMuted);
        if (wasBgmPlaying) {
          sound.startBackgroundMusic();
        }
      }
      finish();
    }, 90000);

    try {
      window.adBreak!({
        type: 'next',
        name: `dhappabaj_round_${completedRound}_video_ad`,
        beforeAd: () => {
          adStarted = true;
          clearTimeout(preAdTimeout);
          wasBgmPlaying = sound.isBgmPlaying();
          wasMuted = sound.getMuted();
          if (wasBgmPlaying) {
            sound.stopBackgroundMusic();
          }
          sound.setMuted(true);
        },
        afterAd: () => {
          sound.setMuted(wasMuted);
          if (wasBgmPlaying) {
            sound.startBackgroundMusic();
          }
        },
        adBreakDone: () => {
          if (adStarted) {
            sound.setMuted(wasMuted);
            if (wasBgmPlaying && !sound.isBgmPlaying()) {
              sound.startBackgroundMusic();
            }
          }
          finish();
        },
      });
    } catch {
      finish();
    }
  });
}
