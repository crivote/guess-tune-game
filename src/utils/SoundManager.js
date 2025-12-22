export class SoundManager {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.masterGain = null;
    }

    setContext(ctx) {
        this.ctx = ctx;
        if (this.ctx) {
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Default volume
            this.masterGain.connect(this.ctx.destination);
        }
    }

    playTone(freq, duration, type = 'sine', startTime = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime + startTime;

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    playStart() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Ascending major chord/glissando
        this.playTone(440, 0.1, 'triangle', 0);
        this.playTone(554, 0.1, 'triangle', 0.1); // C#
        this.playTone(659, 0.4, 'triangle', 0.2); // E
    }

    playCorrect() {
        if (!this.ctx) return;
        // Happy "ding" - high chime
        this.playTone(880, 0.1, 'sine', 0);
        this.playTone(1760, 0.4, 'sine', 0.1);
    }

    playWrongRetry() {
        if (!this.ctx) return;
        // Warning buzz - low square wave
        this.playTone(150, 0.3, 'sawtooth', 0);
        this.playTone(140, 0.3, 'sawtooth', 0.1);
    }

    playWrongFail() {
        if (!this.ctx) return;
        // Descending sad slide
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);

        osc.start(now);
        osc.stop(now + 0.6);
    }

    playGameOver() {
        if (!this.ctx) return;
        // Grand finale chord
        this.playTone(261.63, 1.5, 'triangle', 0); // C4
        this.playTone(329.63, 1.5, 'triangle', 0.1); // E4
        this.playTone(392.00, 1.5, 'triangle', 0.2); // G4
        this.playTone(523.25, 2.0, 'sine', 0.3); // C5
    }
}

export const soundManager = new SoundManager(null);
