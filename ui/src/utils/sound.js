// Sound effect URLs - replace these with your actual sound files
const SOUNDS = {
  background: '/sounds/fantasy-background.mp3',
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  hover: '/sounds/hover.mp3'
};

class SoundManager {
  constructor() {
    this.backgroundMusic = new Audio(SOUNDS.background);
    this.backgroundMusic.loop = true;
    this.enabled = true;
    this.volume = 0.5;
  }

  playBackgroundMusic() {
    if (this.enabled) {
      this.backgroundMusic.volume = this.volume;
      this.backgroundMusic.play().catch(() => {
        // Autoplay might be blocked by browser
        console.log('Background music autoplay blocked');
      });
    }
  }

  stopBackgroundMusic() {
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
  }

  playSound(soundName) {
    if (this.enabled && SOUNDS[soundName]) {
      const sound = new Audio(SOUNDS[soundName]);
      sound.volume = this.volume;
      sound.play().catch(() => {
        console.log('Sound play blocked');
      });
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.backgroundMusic.volume = this.volume;
  }
}

export const soundManager = new SoundManager(); 