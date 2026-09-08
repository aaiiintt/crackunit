// Manual font loading for the dry run. No @remotion/google-fonts dependency
// (the brief allows only remotion + react + typescript), so fonts are loaded
// the same way Remotion's own docs describe for self-hosted files: a native
// FontFace, added to document.fonts, gated behind delayRender/continueRender
// so Remotion waits for the font before it renders a frame.
//
// See otd/FONTS.md for which bible registers these map to, and which faces
// still need to be copied in from a Mac before this is anything but a
// dry run.
import {continueRender, delayRender, staticFile} from 'remotion';

export const FONT_FAMILY = {
	anton: 'Anton',
	anybody: 'Anybody',
	silkscreen: 'Silkscreen',
} as const;

// Liberation is metric-compatible with the Microsoft core-fonts the bible
// specifies (Times New Roman / Arial / Courier New), and is what this box
// actually has installed (see FONTS.md). Used as the fallback stack until
// the real Mac-sourced faces land.
export const FALLBACK_STACK = {
	serif: `'Liberation Serif', 'Times New Roman', serif`,
	sans: `'Liberation Sans', Arial, sans-serif`,
	mono: `'Liberation Mono', 'Courier New', monospace`,
} as const;

const waitForFont = (family: string, source: string, descriptors?: FontFaceDescriptors) => {
	const handle = delayRender(`Loading font: ${family}`);
	const fontFace = new FontFace(family, source, descriptors);

	fontFace
		.load()
		.then((loaded) => {
			document.fonts.add(loaded);
			continueRender(handle);
		})
		.catch((err: unknown) => {
			// Don't hang the render on a missing font file - fall back and log.
			console.error(`Failed to load font "${family}"`, err);
			continueRender(handle);
		});
};

let fontsRequested = false;

// Idempotent: Remotion's bundle re-evaluates the composition module per
// render worker, but calling this more than once in the same document would
// double up delayRender handles.
export const loadFonts = () => {
	if (fontsRequested) {
		return;
	}
	fontsRequested = true;

	waitForFont(FONT_FAMILY.anton, `url(${staticFile('fonts/Anton-Regular.woff2')}) format('woff2')`, {
		weight: '400',
		style: 'normal',
	});

	// True variable font: both wdth (50-150) and wght (100-900) are in the
	// one file, so a single FontFace covers the whole design space.
	waitForFont(FONT_FAMILY.anybody, `url(${staticFile('fonts/Anybody-Variable.woff2')}) format('woff2')`, {
		weight: '100 900',
		stretch: '50% 150%',
		style: 'normal',
	});

	waitForFont(FONT_FAMILY.silkscreen, `url(${staticFile('fonts/Silkscreen-Regular.woff2')}) format('woff2')`, {
		weight: '400',
		style: 'normal',
	});
};
