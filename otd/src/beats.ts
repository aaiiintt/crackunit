// ART-DIRECTION.md §8 "The beat sheet at 720 frames". These are the frame
// boundaries every archetype shares; §6 describes what happens inside each
// range for a specific archetype, §7 for a specific hook. Both read these
// constants rather than hard-coding frame numbers, so the edit grid (every
// cut on a multiple of 6, §1) stays true in one place.
export const BEATS = {
	hookStart: 0,
	hookEnd: 24,
	payoffStart: 24,
	payoffEnd: 90,
	postStart: 90,
	postEnd: 300,
	pageSweepStart: 300, // sweep(36) begins here
	pageSweepEnd: 336,
	pageDwellStart: 336, // "from f336 to f480 only the camera moves" — §8
	pageEnd: 480,
	scoreStart: 480,
	scoreEnd: 600,
	studioStart: 600,
	studioEnd: 690,
	loopStart: 690,
	loopEnd: 720,
} as const;

// Sanity: every value above must sit on the 6-frame edit grid.
if (process.env.NODE_ENV !== 'production') {
	for (const [key, value] of Object.entries(BEATS)) {
		if (value % 6 !== 0) {
			// eslint-disable-next-line no-console
			console.warn(`beats.ts: ${key}=${value} is not on the 6-frame edit grid`);
		}
	}
}

export const TOTAL_FRAMES = 720;

// §8's fixed studio-card positions, x 72 left-aligned.
export const STUDIO_CARD = {
	x: 72,
	dateY: 700,
	urlY: 820,
	linkInBioY: 900,
} as const;

// §8's page-beat dolly: 60px total over the dwell.
export const PAGE_DOLLY_PX = 60;
export const PAGE_DWELL_FRAMES = BEATS.pageEnd - BEATS.pageDwellStart; // 144, matches §14's minimum
