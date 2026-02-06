class SoundEngine {
    constructor(waveType = 'sine', adsrValues = [ 0.0, 0.125, 0.8, 0.0625 ],
                reverbValues = [ 3, 1, 0.8 ]) {

        this.frequency = 2048;
        this.volume = 0.8;

        this.oscillator = new p5.Oscillator(waveType);

        this.envelope = new p5.Envelope();
        this.envelope.setADSR(adsrValues[0], adsrValues[1], adsrValues[2],
                              adsrValues[3]);

        this.oscillator.disconnect();
        this.oscillator.amp(this.envelope);
        this.oscillator.start();

        this.panner = new p5.Panner3D();
        this.panner.panner.panningModel = 'HRTF';
        this.panner.panner.distanceModel = 'exponential';
        this.panner.process(this.oscillator);
        this.panner.disconnect();

        this.reverb = new p5.Reverb();
        this.reverb.set(reverbValues[0], reverbValues[1]);
        this.reverb.drywet(reverbValues[2]);

        this.reverb.process(this.panner);
        this.reverb.amp(this.volume);

        this.isTriggered = false;
    }

    setFrequency(freqValue) {
        this.frequency = freqValue;
        this.oscillator.freq(this.frequency);
    }

    setVolume(volValue) {
        this.volume = volValue;
        this.reverb.amp(this.volume);
    }

    setPannerPosition(x, y, z) { this.panner.set(x, y, z); }

    triggerSound(triggerValue) {
        if (triggerValue && !this.isTriggered) {
            this.envelope.play();
            this.isTriggered = true;
        } else if (!triggerValue && this.isTriggered) {
            this.isTriggered = false;
        }
    }
}
