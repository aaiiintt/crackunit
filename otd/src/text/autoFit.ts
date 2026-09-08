// The line's autoscale (bible §3 amendment, per round-two redline): start at
// 220px cap, step down to 140px, until the full text wraps into at most 4
// lines at the safe width (892px, x 48 to 940). Never truncate — if even
// 140px doesn't fit 4 lines, keep 140px and let it wrap past 4 lines rather
// than hide content.
//
// Measured with a canvas 2D context: synchronous, no async font-loading
// wait needed because every face this measures ("Liberation Serif" for the
// line, "Liberation Sans" for Grotesk) is an OS-installed font already
// resolvable by the browser, not a webfont behind a FontFace load.
let measureCanvas: HTMLCanvasElement | null = null;
const getCtx = (): CanvasRenderingContext2D => {
	if (!measureCanvas) {
		measureCanvas = document.createElement('canvas');
	}
	const ctx = measureCanvas.getContext('2d');
	if (!ctx) {
		throw new Error('autoFit: 2D canvas context unavailable');
	}
	return ctx;
};

export const wrapLines = (text: string, maxWidth: number, font: string): string[] => {
	const ctx = getCtx();
	ctx.font = font;
	const words = text.split(' ');
	const lines: string[] = [];
	let current = '';
	for (const word of words) {
		const test = current ? `${current} ${word}` : word;
		if (current && ctx.measureText(test).width > maxWidth) {
			lines.push(current);
			current = word;
		} else {
			current = test;
		}
	}
	if (current) lines.push(current);
	return lines;
};

export type AutoFitOptions = {
	maxWidth: number;
	maxLines?: number;
	minSize?: number;
	maxSize?: number;
	step?: number;
	fontFamily: string;
};

export const autoFitSize = (
	text: string,
	{maxWidth, maxLines = 4, minSize = 140, maxSize = 220, step = 10, fontFamily}: AutoFitOptions,
): number => {
	for (let size = maxSize; size >= minSize; size -= step) {
		const lines = wrapLines(text, maxWidth, `${size}px ${fontFamily}`);
		if (lines.length <= maxLines) {
			return size;
		}
	}
	// Never truncate: fall back to the minimum size even if it still wraps
	// past maxLines — more lines, not hidden content.
	return minSize;
};
