#!/usr/bin/env node
// Synthesises the on-this-day SFX bed as raw-PCM WAV files, no dependencies
// (there is no network for CC0 samples in this sandbox — see CLAUDE.md-style
// note in the brief). Writes to public/sfx/*.wav at 48kHz mono 16-bit.
//
// Bible reference: docs/on-this-day/ART-DIRECTION.md §9 "Sound". This dry
// run implements exactly the events the build brief calls out:
//   click              — the 1-frame click, 2kHz, -18dB. Every `cut`.
//   shutter            — camera shutter, short noise burst. `kineticJump`.
//   whoosh             — filtered noise sweep pitched down. `sweep`.
//   modem-chirp        — rising tone burst. `cascade`, one per item.
//   dialog-chord       — three sine tones, 0.3s. Dialog open.
//   dialog-chord-reverse — the same, time-reversed. Dialog close.
//   ratchet-tick       — ratchet tick. `slotDigits` (H5, out of this dry
//                        run's hook scope, but the asset is cheap to make and
//                        future archetypes may want it).
//   sting              — C5, G5, C6 square waves 10 frames apart, 0.4s
//                        release. The studio card. Never changes.
//
// Idempotent: re-running overwrites the same files with the same bytes
// (everything here is deterministic, no seeding needed — these are fixed
// house sounds, not per-day content).
import {writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(here, '..', 'public', 'sfx');
mkdirSync(OUT_DIR, {recursive: true});

const SAMPLE_RATE = 48000;
const FPS = 60;
const FRAME_S = 1 / FPS;

// ---- dB <-> linear -------------------------------------------------------
const dbToLinear = (db) => Math.pow(10, db / 20);

// ---- WAV writer (PCM 16-bit mono) ----------------------------------------
const writeWav = (path, floatSamples, sampleRate = SAMPLE_RATE) => {
	const numSamples = floatSamples.length;
	const bytesPerSample = 2;
	const blockAlign = bytesPerSample; // mono
	const byteRate = sampleRate * blockAlign;
	const dataSize = numSamples * bytesPerSample;
	const buffer = Buffer.alloc(44 + dataSize);

	buffer.write('RIFF', 0, 'ascii');
	buffer.writeUInt32LE(36 + dataSize, 4);
	buffer.write('WAVE', 8, 'ascii');
	buffer.write('fmt ', 12, 'ascii');
	buffer.writeUInt32LE(16, 16); // PCM fmt chunk size
	buffer.writeUInt16LE(1, 20); // audio format = PCM
	buffer.writeUInt16LE(1, 22); // channels = mono
	buffer.writeUInt32LE(sampleRate, 24);
	buffer.writeUInt32LE(byteRate, 28);
	buffer.writeUInt16LE(blockAlign, 32);
	buffer.writeUInt16LE(16, 34); // bits per sample
	buffer.write('data', 36, 'ascii');
	buffer.writeUInt32LE(dataSize, 40);

	for (let i = 0; i < numSamples; i++) {
		const clamped = Math.max(-1, Math.min(1, floatSamples[i]));
		buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
	}
	writeFileSync(path, buffer);
	console.log(`wrote ${path} (${(dataSize / 1024).toFixed(1)} KB, ${(numSamples / sampleRate).toFixed(3)}s)`);
};

// ---- signal helpers --------------------------------------------------------
const seconds = (s) => Math.round(s * SAMPLE_RATE);

// Deterministic "white noise" (LCG) so re-runs are byte-identical.
const makeNoise = (n, seed = 1) => {
	let s = seed >>> 0 || 1;
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
		out[i] = (s / 4294967296) * 2 - 1;
	}
	return out;
};

// Simple one-pole low-pass, coefficient in (0,1]; smaller = more smoothing.
const lowPass = (samples, alpha) => {
	const out = new Float32Array(samples.length);
	let prev = 0;
	for (let i = 0; i < samples.length; i++) {
		prev = prev + alpha * (samples[i] - prev);
		out[i] = prev;
	}
	return out;
};

const envelopeLinear = (n, attackN, releaseN) => {
	const env = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		if (i < attackN) env[i] = i / attackN;
		else if (i > n - releaseN) env[i] = Math.max(0, (n - i) / releaseN);
		else env[i] = 1;
	}
	return env;
};

const sine = (n, freq, phase0 = 0) => {
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		out[i] = Math.sin(phase0 + (2 * Math.PI * freq * i) / SAMPLE_RATE);
	}
	return out;
};

const square = (n, freq) => {
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const phase = (freq * i) / SAMPLE_RATE - Math.floor((freq * i) / SAMPLE_RATE);
		out[i] = phase < 0.5 ? 1 : -1;
	}
	return out;
};

const mix = (n, ...tracks) => {
	const out = new Float32Array(n);
	for (const [track, offset = 0, gain = 1] of tracks) {
		for (let i = 0; i < track.length; i++) {
			const j = i + offset;
			if (j >= 0 && j < n) out[j] += track[i] * gain;
		}
	}
	return out;
};

// ============================================================================
// 1. click — 1 frame (1/60s), 2kHz sine, -18dB peak, quick decay so it reads
//    as a tick, not a tone.
// ============================================================================
{
	const n = seconds(FRAME_S * 1.4); // slightly longer than 1 frame so the
	// decay tail doesn't get truncated (the "1-frame" figure describes the
	// event's picture-timeline footprint, not that the whole waveform must
	// literally end at 1 frame).
	const tone = sine(n, 2000);
	const env = envelopeLinear(n, seconds(0.001), n - seconds(0.001));
	const peak = dbToLinear(-18);
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) out[i] = tone[i] * env[i] * peak;
	writeWav(join(OUT_DIR, 'click.wav'), out);
}

// ============================================================================
// 2. shutter — camera shutter, short noise burst (~50ms), sharp attack, fast
//    decay, lightly filtered so it doesn't read as pure static.
// ============================================================================
{
	const n = seconds(0.05);
	const noise = lowPass(makeNoise(n, 7), 0.6);
	const env = envelopeLinear(n, seconds(0.002), n - seconds(0.002));
	const peak = dbToLinear(-10);
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) out[i] = noise[i] * env[i] * peak;
	writeWav(join(OUT_DIR, 'shutter.wav'), out);
}

// ============================================================================
// 3. whoosh — filtered noise sweep pitched down: cutoff frequency (the
//    low-pass alpha) decreases across the sample, so brightness falls from
//    open to dark, matching "pitched down 12 semitones" in spirit (a literal
//    pitch shift needs a resonant filter; this is the CC0-free approximation
//    the brief allows — "recreated" sound design).
// ============================================================================
{
	const durationS = 24 / FPS; // matches a typical 24-frame sweep; playbackRate
	// at the call site stretches this to 18 or 36 frames as needed.
	const n = seconds(durationS);
	const noise = makeNoise(n, 42);
	const out = new Float32Array(n);
	let prev = 0;
	for (let i = 0; i < n; i++) {
		const t = i / n;
		// alpha sweeps from bright (0.9) to dark (0.03) — "pitched down".
		const alpha = 0.9 - t * 0.87;
		prev = prev + alpha * (noise[i] - prev);
		out[i] = prev;
	}
	const env = envelopeLinear(n, seconds(0.01), seconds(0.08));
	const peak = dbToLinear(-9);
	for (let i = 0; i < n; i++) out[i] *= env[i] * peak;
	writeWav(join(OUT_DIR, 'whoosh.wav'), out);
}

// ============================================================================
// 4. modem-chirp — rising tone burst (a single chirp; §9 says "each a
//    semitone higher" per cascade item — the caller pitches this up per item
//    via <Audio playbackRate>).
// ============================================================================
{
	const n = seconds(0.15);
	const out = new Float32Array(n);
	const f0 = 900;
	const f1 = 2600;
	let phase = 0;
	for (let i = 0; i < n; i++) {
		const t = i / n;
		const freq = f0 + (f1 - f0) * t * t; // accelerating rise
		phase += (2 * Math.PI * freq) / SAMPLE_RATE;
		out[i] = Math.sin(phase);
	}
	const env = envelopeLinear(n, seconds(0.005), seconds(0.05));
	const peak = dbToLinear(-11);
	for (let i = 0; i < n; i++) out[i] *= env[i] * peak;
	writeWav(join(OUT_DIR, 'modem-chirp.wav'), out);
}

// ============================================================================
// 5/6. dialog-chord / dialog-chord-reverse — three sine tones, 0.3s. "Not
//      the Windows one; a cousin" — a plain minor triad (A3, C4, E4) rather
//      than the Windows Ding/Chord's actual intervals.
// ============================================================================
{
	const n = seconds(0.3);
	const freqs = [220.0, 261.63, 329.63]; // A3, C4, E4 — minor triad
	const env = envelopeLinear(n, seconds(0.01), seconds(0.2));
	const peak = dbToLinear(-8);
	const out = new Float32Array(n);
	for (const f of freqs) {
		const tone = sine(n, f);
		for (let i = 0; i < n; i++) out[i] += (tone[i] / freqs.length) * env[i] * peak;
	}
	writeWav(join(OUT_DIR, 'dialog-chord.wav'), out);

	const reversed = new Float32Array(n);
	for (let i = 0; i < n; i++) reversed[i] = out[n - 1 - i];
	writeWav(join(OUT_DIR, 'dialog-chord-reverse.wav'), reversed);
}

// ============================================================================
// 7. ratchet-tick — a short, dry percussive tick (filtered noise, ~15ms).
//    §9 pairs this with slotDigits (H5), out of this dry run's hook scope,
//    but the asset is cheap and future archetypes may want it.
// ============================================================================
{
	const n = seconds(0.015);
	const noise = lowPass(makeNoise(n, 99), 0.8);
	const env = envelopeLinear(n, seconds(0.001), n - seconds(0.001));
	const peak = dbToLinear(-10);
	const out = new Float32Array(n);
	for (let i = 0; i < n; i++) out[i] = noise[i] * env[i] * peak;
	writeWav(join(OUT_DIR, 'ratchet-tick.wav'), out);
}

// ============================================================================
// 8. sting — C5, G5, C6 square waves, 10 frames apart, 0.4s release each.
//    "The series signature. Never changes."
// ============================================================================
{
	const NOTE_GAP_S = 10 / FPS;
	const RELEASE_S = 0.4;
	const notes = [
		{freq: 523.25, offsetS: 0 * NOTE_GAP_S}, // C5
		{freq: 783.99, offsetS: 1 * NOTE_GAP_S}, // G5
		{freq: 1046.5, offsetS: 2 * NOTE_GAP_S}, // C6
	];
	const noteDurationS = RELEASE_S + 0.02;
	const totalS = notes[notes.length - 1].offsetS + noteDurationS;
	const n = seconds(totalS);
	const out = new Float32Array(n);
	const peak = dbToLinear(-6);
	for (const {freq, offsetS} of notes) {
		const noteN = seconds(noteDurationS);
		const tone = square(noteN, freq);
		const env = envelopeLinear(noteN, seconds(0.005), seconds(RELEASE_S));
		const offset = seconds(offsetS);
		for (let i = 0; i < noteN; i++) {
			const j = i + offset;
			if (j < n) out[j] += tone[i] * env[i] * peak * 0.5; // 0.5: headroom for overlap
		}
	}
	writeWav(join(OUT_DIR, 'sting.wav'), out);
}

console.log('\nAll SFX written to', OUT_DIR);
