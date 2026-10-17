let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null;
  if (!context) context = new AudioContext();
  return context;
}

export function unlockAudio() {
  const audio = getContext();
  if (audio && audio.state === "suspended") void audio.resume();
}

export function playChime(volume: number) {
  const audio = getContext();
  if (!audio || volume <= 0) return;
  if (audio.state === "suspended") void audio.resume();

  const notes = [659.25, 783.99, 1046.5];
  const start = audio.currentTime + 0.05;

  notes.forEach((frequency, index) => {
    const time = start + index * 0.22;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.35), time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(time);
    oscillator.stop(time + 1);
  });
}
