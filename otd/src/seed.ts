// Deterministic PRNG seeded by MM-DD (or any string), so a re-render of the
// same day gives the same jitter, same z-offsets, same cut ordering — per
// §12's "deterministic ordering (seeded by MM-DD)".
//
// mulberry32: tiny, fast, good enough statistical quality for art-direction
// jitter (it is not used for anything cryptographic). Seeded from a string
// via a simple FNV-1a hash so callers can pass "09-12" directly.

const fnv1a = (str: string): number => {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
};

export type Rng = () => number;

// Returns a function that yields floats in [0, 1), advancing state each call.
export const makeRng = (seedStr: string): Rng => {
	let a = fnv1a(seedStr) || 1;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

// Convenience: a seeded integer in [min, max] inclusive.
export const rngInt = (rng: Rng, min: number, max: number): number =>
	min + Math.floor(rng() * (max - min + 1));

// Convenience: a seeded float in [min, max).
export const rngFloat = (rng: Rng, min: number, max: number): number => min + rng() * (max - min);

// Deterministically pick one element of an array using a seeded rng.
export const rngPick = <T>(rng: Rng, arr: readonly T[]): T => arr[rngInt(rng, 0, arr.length - 1)];
