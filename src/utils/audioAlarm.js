/**
 * Ultra-Loud Dual-Tone Synthesizer Alarm System using Web Audio API
 * Generates an unmistakable, high-penetration siren through device speakers.
 */

let audioCtx = null;
let isAlarmPlaying = false;
let alarmInterval = null;
let activeOscillators = [];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playLoudTone(freq = 900, duration = 0.25, type = 'sawtooth') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Boost volume with gain envelope
    gain.gain.setValueAtTime(0.85, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
    activeOscillators.push(osc);
  } catch (err) {
    console.error('Audio play error:', err);
  }
}

export function startLoudAlarm() {
  if (isAlarmPlaying) return;
  isAlarmPlaying = true;

  try {
    const ctx = getAudioContext();
    ctx.resume();
  } catch (e) {}

  let toggle = false;

  // Urgent dual-tone siren pattern (950Hz & 1300Hz pulsating emergency pattern)
  const beepBurst = () => {
    if (!isAlarmPlaying) return;
    
    toggle = !toggle;
    const baseFreq = toggle ? 1250 : 920;
    
    // Play dual harmonics for max loudness and speaker penetration
    playLoudTone(baseFreq, 0.2, 'sawtooth');
    setTimeout(() => {
      if (isAlarmPlaying) {
        playLoudTone(baseFreq + 350, 0.2, 'square');
      }
    }, 120);
  };

  beepBurst();
  alarmInterval = setInterval(beepBurst, 350);
}

export function stopLoudAlarm() {
  isAlarmPlaying = false;
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  activeOscillators.forEach(osc => {
    try { osc.stop(); } catch (e) {}
  });
  activeOscillators = [];
}

export function testLoudAlarm(durationMs = 2500) {
  startLoudAlarm();
  setTimeout(() => {
    stopLoudAlarm();
  }, durationMs);
}
