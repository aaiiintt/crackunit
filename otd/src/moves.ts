// ART-DIRECTION.md §4 "Motion vocabulary" as interpolation helpers. All at
// 60fps, all meant to land on the 6-frame edit grid (§1) at the call site —
// these helpers take an arrival/start frame and do not enforce the grid
// themselves, since a handful of intra-cascade frames legitimately fall off
// it (cascade steps are 4 frames apart, layerStack 3).
//
// `layerStrobe` is intentionally NOT implemented here — the bible requires a
// flash limiter ("no more than 3 luminance flips per second, and never a
// full-frame flip") and getting that limiter provably correct is more than
// this dry run's scope affords. No archetype in this dry run's scope (A1,
// A3, A4, A6, A7) calls for it, so it is omitted rather than guessed at.
import {Easing, interpolate} from 'remotion';

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// A cut where the camera lands 8% past its target and settles back in 6
// frames, easeOutBack 1.4.
export const kineticJump = (
	frame: number,
	jumpFrame: number,
	from: number,
	to: number,
): number => {
	return interpolate(frame, [jumpFrame, jumpFrame + 6], [from, to], {
		...clampOpts,
		easing: Easing.out(Easing.back(1.4)),
	});
};

// Camera dolly/truck between two planes, easeOutExpo. Duration is 18, 24 or
// 36 frames per the bible; caller picks.
export const sweep = (
	frame: number,
	startFrame: number,
	durationFrames: 18 | 24 | 36,
	from: number,
	to: number,
): number => {
	return interpolate(frame, [startFrame, startFrame + durationFrames], [from, to], {
		...clampOpts,
		easing: Easing.out(Easing.exp),
	});
};

// N windows/blocks appear 4 frames apart, each scaling 96% -> 100% over 3
// frames, no easing (linear). Returns {opacity, scale} for item `index`.
export const cascade = (
	frame: number,
	startFrame: number,
	index: number,
	spacing = 4,
): {opacity: number; scale: number; visible: boolean} => {
	const arrival = startFrame + index * spacing;
	const opacity = frame >= arrival ? 1 : 0;
	const scale = interpolate(frame, [arrival, arrival + 3], [0.96, 1], {
		...clampOpts,
		easing: Easing.linear,
	});
	return {opacity, scale, visible: frame >= arrival};
};

// Collage elements pop in 3 frames apart, no scale, no easing — a hard
// opacity step. Order is caller's responsibility (ground, mid, specimen,
// tags, type per §4).
export const layerStack = (
	frame: number,
	startFrame: number,
	index: number,
	spacing = 3,
): {opacity: number; visible: boolean} => {
	const arrival = startFrame + index * spacing;
	return {opacity: frame >= arrival ? 1 : 0, visible: frame >= arrival};
};

// §3's arrival: 5 frames, easeOutBack overshoot 1.7, settling after a
// 2-frame overshoot. Returns a scale to apply to the type element (1 at
// rest, overshooting past 1 on the way in) and an opacity that pops in on
// frame 1 (type never fades in, per §3's "arrival and departure").
export const typeIn = (
	frame: number,
	arrivalFrame: number,
): {opacity: number; scale: number} => {
	const opacity = frame >= arrivalFrame ? 1 : 0;
	const scale = interpolate(frame, [arrivalFrame, arrivalFrame + 5], [0.7, 1], {
		...clampOpts,
		easing: Easing.out(Easing.back(1.7)),
	});
	return {opacity, scale};
};

// Cursor moves on a 12-frame easeInOutSine, click is a 2-frame down state,
// target reacts on the 3rd frame after click start.
export const cursor = (
	frame: number,
	startFrame: number,
	from: {x: number; y: number},
	to: {x: number; y: number},
): {x: number; y: number; clicking: boolean; targetReacted: boolean} => {
	const moveEnd = startFrame + 12;
	const x = interpolate(frame, [startFrame, moveEnd], [from.x, to.x], {
		...clampOpts,
		easing: Easing.inOut(Easing.sin),
	});
	const y = interpolate(frame, [startFrame, moveEnd], [from.y, to.y], {
		...clampOpts,
		easing: Easing.inOut(Easing.sin),
	});
	const clicking = frame >= moveEnd && frame < moveEnd + 2;
	const targetReacted = frame >= moveEnd + 3;
	return {x, y, clicking, targetReacted};
};

// hue-rotate on the collage plane texture only. Max one full 360deg cycle
// per video (90 frames per full cycle, per the bible's ratio — a full video
// is 720 frames so this yields 8 cycles at that literal ratio; callers
// should pass a startFrame/duration that fits their archetype's single-cycle
// budget instead of relying on the ratio literally).
export const chromaCycle = (
	frame: number,
	startFrame: number,
	durationFrames: number,
): number => {
	return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 360], {
		...clampOpts,
		easing: Easing.linear,
	});
};

// Collage plane UVs mirrored 2x2 or 4x4 behind the line. This is a DOM
// stand-in for a texture-UV mirror: it returns per-cell transforms for a
// grid of `size x size` tiles, alternating flips so adjacent tiles mirror.
export const mirrorTile = (
	size: 2 | 4,
): Array<{row: number; col: number; scaleX: number; scaleY: number}> => {
	const cells: Array<{row: number; col: number; scaleX: number; scaleY: number}> = [];
	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			cells.push({row, col, scaleX: col % 2 === 0 ? 1 : -1, scaleY: row % 2 === 0 ? 1 : -1});
		}
	}
	return cells;
};

// Generic "the final N frames bring the moving object to the exact state of
// frame 0" helper: linear, motion-matched (never eased, never faded), for
// use inside each archetype's specific loop mechanic (§6/§7).
export const loopReturn = (
	frame: number,
	loopStart: number,
	loopEnd: number,
	from: number,
	to: number,
): number => {
	return interpolate(frame, [loopStart, loopEnd], [from, to], {
		...clampOpts,
		easing: Easing.linear,
	});
};

// Infinite fall at a constant px/frame rate, wrapped over the given period —
// the building block behind A1/H3's "specimen enters falling, exits falling
// at the same rate, one frame above its f0 position at f719" loop mechanic.
export const fallingY = (frame: number, startY: number, pxPerFrame: number, period = 720): number => {
	return startY + ((frame % period) * pxPerFrame);
};
