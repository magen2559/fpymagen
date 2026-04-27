import { Audio } from 'expo-av';

type SoundName = 'ocean' | 'night' | 'forest' | 'rain';

// We use generated tones as placeholders.
// Replace these with real ambient .mp3 files in assets/sounds/ for production.
const SOUND_ASSETS: Record<SoundName, any> = {
    ocean: require('../assets/sounds/ocean.wav'),
    night: require('../assets/sounds/night.wav'),
    forest: require('../assets/sounds/forest.wav'),
    rain: require('../assets/sounds/rain.wav'),
};

class SoundManager {
    private currentSound: Audio.Sound | null = null;
    private currentName: SoundName | null = null;
    private muted: boolean = false;

    async play(name: SoundName) {
        // If the same sound is already playing, do nothing
        if (this.currentName === name && this.currentSound) {
            return;
        }

        // Stop any current sound
        await this.stop();

        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const { sound } = await Audio.Sound.createAsync(
                SOUND_ASSETS[name],
                { isLooping: true, volume: this.muted ? 0 : 0.5 }
            );

            this.currentSound = sound;
            this.currentName = name;
            await sound.playAsync();
        } catch (e) {
            console.warn('Sound playback failed:', e);
        }
    }

    async stop() {
        if (this.currentSound) {
            try {
                await this.currentSound.stopAsync();
                await this.currentSound.unloadAsync();
            } catch (e) { }
            this.currentSound = null;
            this.currentName = null;
        }
    }

    async toggleMute(): Promise<boolean> {
        this.muted = !this.muted;
        if (this.currentSound) {
            try {
                await this.currentSound.setVolumeAsync(this.muted ? 0 : 0.5);
            } catch (e) { }
        }
        return this.muted;
    }

    isMuted(): boolean {
        return this.muted;
    }

    getCurrentSound(): SoundName | null {
        return this.currentName;
    }
}

// Singleton
export const soundManager = new SoundManager();
export type { SoundName };
