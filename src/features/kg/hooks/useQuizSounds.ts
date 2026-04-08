import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

export function useQuizSounds(soundEnabled: boolean) {
  const correctSoundRef = useRef<Audio.Sound | null>(null);
  const incorrectSoundRef = useRef<Audio.Sound | null>(null);

  const playCorrectSound = useCallback(async () => {
    if (!soundEnabled) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );
      correctSoundRef.current = sound;
      setTimeout(async () => {
        await sound.unloadAsync();
      }, 1000);
    } catch (error) {
    }
  }, [soundEnabled]);

  const playIncorrectSound = useCallback(async () => {
    if (!soundEnabled) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/fail-buzzer-01.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );
      incorrectSoundRef.current = sound;
      setTimeout(async () => {
        await sound.unloadAsync();
      }, 500);
    } catch (error) {
    }
  }, [soundEnabled]);

  return {
    playCorrectSound,
    playIncorrectSound,
  };
}
