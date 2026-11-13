// Record a short clip from the microphone (a friend's name in the child's own voice).
// Nothing leaves the device: the clip becomes a small data URL saved with the friend.
// Browsers only allow the mic on https (or localhost); elsewhere micSupported() is false and the game hides the mic.

export const micSupported = () =>
  typeof window !== 'undefined' && window.isSecureContext && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

export type Recording = { url: string; /** loudest moment, 0–1: below ~0.04 nothing was really said */ peak: number };
export const HEARD = 0.04;

function pickType() {
  for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) if (MediaRecorder.isTypeSupported?.(t)) return t;
  return '';
}

/** Record for `ms` (or until stop() is called). onLevel gets the live loudness for the animation. */
export function startRecording(ms: number, onLevel?: (v: number) => void): { done: Promise<Recording>; stop: () => void } {
  let stopFn = () => {};
  const done = (async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const type = pickType();
    const rec = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), audioBitsPerSecond: 32000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    // Loudness meter
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new AC();
    const an = ac.createAnalyser();
    an.fftSize = 512;
    ac.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize);
    let peak = 0, raf = 0;
    const meter = () => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const x of buf) sum += x * x;
      const rms = Math.sqrt(sum / buf.length);
      peak = Math.max(peak, rms);
      onLevel?.(Math.min(1, rms * 6));
      raf = requestAnimationFrame(meter);
    };
    meter();
    const stopped = new Promise<void>((r) => { rec.onstop = () => r(); });
    rec.start();
    const timer = setTimeout(() => rec.state !== 'inactive' && rec.stop(), ms);
    stopFn = () => { clearTimeout(timer); if (rec.state !== 'inactive') rec.stop(); };
    await stopped;
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((tr) => tr.stop());
    void ac.close();
    const blob = new Blob(chunks, { type: rec.mimeType || type || 'audio/mp4' });
    const url = await new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(String(fr.result)); fr.readAsDataURL(blob); });
    return { url, peak };
  })();
  return { done, stop: () => stopFn() };
}
