/**
 * Voice narration utility using the Web Speech API.
 * Provides text-to-speech capabilities for educational narration
 * synchronized with 3D neural network visualization.
 */

class VoiceNarrator {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private enabled: boolean = true;
  private speaking: boolean = false;
  private rate: number = 0.9; // Slightly slow for educational clarity
  private pitch: number = 1.0;
  private volume: number = 0.8;
  private supported: boolean = false;

  constructor() {
    // Guard against environments without speechSynthesis (SSR, some browsers)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.supported = true;
      this.selectVoice();
      // Voices may load asynchronously in some browsers
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.selectVoice();
      }
    }
  }

  private selectVoice(): void {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return;

    // Prefer: Google US English > any en-US > any English > first available
    this.voice =
      voices.find((v) => v.name.includes('Google US English')) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null;
  }

  /**
   * Speak the given text. Cancels any current speech first.
   * Calls onEnd when the utterance finishes (or immediately if not enabled).
   */
  speak(text: string, onEnd?: () => void): void {
    if (!this.supported || !this.synth || !this.enabled || !text) {
      onEnd?.();
      return;
    }

    // Cancel any current speech to avoid queue buildup
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    utterance.onstart = () => {
      this.speaking = true;
    };
    utterance.onend = () => {
      this.speaking = false;
      onEnd?.();
    };
    utterance.onerror = () => {
      this.speaking = false;
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  /** Stop any current speech immediately. */
  stop(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.speaking = false;
  }

  /** Enable or disable voice narration. Disabling also stops current speech. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }

  /** Set speech rate (clamped 0.5 to 2.0). */
  setRate(rate: number): void {
    this.rate = Math.max(0.5, Math.min(2, rate));
  }

  /** Set speech volume (clamped 0 to 1). */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /** Whether the narrator is currently speaking. */
  isSpeaking(): boolean {
    return this.speaking;
  }

  /** Whether voice narration is enabled. */
  isEnabled(): boolean {
    return this.enabled;
  }

  /** Whether the Web Speech API is supported in this browser. */
  isSupported(): boolean {
    return this.supported;
  }
}

// Singleton instance
export const voiceNarrator = new VoiceNarrator();
