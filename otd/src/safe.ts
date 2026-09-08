// ART-DIRECTION.md §1 "Frame, grid, safe areas". All values at the 1080x1920
// design unit; multiply by 2 for the 4K master (this dry run renders at
// design scale, so no multiplication is applied here).
export const FRAME = {
	width: 1080,
	height: 1920,
	fps: 60,
	durationInFrames: 720,
} as const;

// Instagram chrome zones — hold nothing that must be read.
export const IG_TOP = {x0: 0, y0: 0, x1: 1080, y1: 220} as const;
export const IG_BOTTOM = {x0: 0, y0: 1500, x1: 1080, y1: 1920} as const;
export const IG_RIGHT_RAIL = {x0: 940, y0: 0, x1: 1080, y1: 1920} as const;

// Type safe area: the line, the date, the URL live here. Junk can and should
// break out of it.
export const TYPE_SAFE = {x0: 48, y0: 220, x1: 940, y1: 1500} as const;

// Cover crop: the profile grid shows a centre 4:5 crop of the cover.
export const COVER_CROP = {x0: 0, y0: 285, x1: 1080, y1: 1635} as const;

// Edit grid: every cut on a multiple of 6 frames, every layer arrival on a
// multiple of 3.
export const CUT_GRID = 6;
export const ARRIVAL_GRID = 3;
