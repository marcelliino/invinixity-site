class PatternMachine {
    constructor(interval = 1.0, pattern = [ 1.0, 0.0, 1.0 ]) {
        this.interval = interval;
        this.pattern = pattern;

        this.currentIndex = 0;
        this.lastTriggerTime = 0;
    }

    update(time) {
        if (time - this.lastTriggerTime >= this.interval) {
            this.lastTriggerTime = time;

            if (this.pattern[this.currentIndex] === 1) {
                return true;
            }

            this.currentIndex = (this.currentIndex + 1) % this.pattern.length;
        }
        return false;
    }

    setPattern(newPattern) {
        this.pattern = newPattern;
        this.currentIndex = 0;
    }

    setInterval(newInterval) { this.interval = newInterval; }
}
