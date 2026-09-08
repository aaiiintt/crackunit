// Maps move names (§4/§9) to the WAV files scripts/make-sfx.mjs writes into
// public/sfx/, and provides <Sfx> to place them on the exact frame numbers
// as the picture. §9: "Rendered audio is SFX only, at -6dB overall so the
// in-app track sits over it."
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

export const BED_VOLUME_DB = -6;
export const dbToLinear = (db: number): number => Math.pow(10, db / 20);
export const BED_VOLUME = dbToLinear(BED_VOLUME_DB);

// File-level volumes are already baked into the WAVs by make-sfx.mjs (per
// §9's per-event dB figures); BED_VOLUME is the *additional* -6dB the whole
// bed sits at so the in-app track reads over it.
export const SFX_FILE = {
	click: staticFile('sfx/click.wav'),
	shutter: staticFile('sfx/shutter.wav'),
	whoosh: staticFile('sfx/whoosh.wav'),
	modemChirp: staticFile('sfx/modem-chirp.wav'),
	dialogChord: staticFile('sfx/dialog-chord.wav'),
	dialogChordReverse: staticFile('sfx/dialog-chord-reverse.wav'),
	ratchetTick: staticFile('sfx/ratchet-tick.wav'),
	sting: staticFile('sfx/sting.wav'),
} as const;

export type SfxKey = keyof typeof SFX_FILE;

// §9's move -> sound table. A couple of §9's rows ("Mouse click per layer",
// "Two-tone click") don't get a bespoke file in this dry run's make-sfx.mjs
// (the brief's asset list is exactly: click, shutter, whoosh, modem-chirp,
// dialog-chord(+reverse), ratchet-tick, sting) — those reuse `click`,
// documented at the call site, not invented here.
export const MOVE_SFX: Record<string, SfxKey> = {
	cut: 'click',
	kineticJump: 'shutter',
	sweep: 'whoosh',
	cascade: 'modemChirp',
	layerStack: 'click', // "mouse click per layer" — no bespoke asset, reuse click
	cursorClick: 'click', // "two-tone click" — reuse click
	dialogOpen: 'dialogChord',
	dialogClose: 'dialogChordReverse',
	slotDigits: 'ratchetTick',
	studioCard: 'sting',
};

// Places one SFX hit at `atFrame` for `durationInFrames` (defaults to the
// file's own natural length by omitting durationInFrames — Remotion trims
// to the underlying media automatically when unset, but a Sequence still
// needs an explicit duration in this codebase's Remotion version, so pass
// a generous one and let the audio itself end early).
export const Sfx: React.FC<{
	name: SfxKey;
	atFrame: number;
	durationInFrames?: number;
	volumeDb?: number;
	playbackRate?: number;
}> = ({name, atFrame, durationInFrames = 60, volumeDb = 0, playbackRate = 1}) => {
	return React.createElement(
		Sequence,
		{from: atFrame, durationInFrames, layout: 'none'},
		React.createElement(Audio, {
			src: SFX_FILE[name],
			volume: BED_VOLUME * dbToLinear(volumeDb),
			playbackRate,
		}),
	);
};
