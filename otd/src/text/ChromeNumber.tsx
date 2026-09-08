// §3 "Impact": Impact.ttf not available on this box (FONTS.md), bible's own
// documented fallback is Anton. The bible also calls for this register to be
// "only ever extruded in the R3F layer... chrome material. Never flat."
// There is no R3F layer in this CSS-3D dry run, so per this build's brief:
// render in Anton with a FAKE chrome (a CSS gradient clipped to text) rather
// than attempting real 3D extrusion. Used for H6/H5-style year/number
// treatments if an archetype needs one in this dry run's scope.
import React from 'react';
import {FONT_FAMILY, FALLBACK_STACK} from '../fonts';

// A hard, unsmoothed chrome-ish gradient — banded steps rather than a soft
// blend, closer to the bible's "nothing muted" palette instinct than a
// realistic chrome material would be.
const CHROME_GRADIENT =
	'linear-gradient(180deg, #ffffff 0%, #b8b8c8 20%, #6a6a78 45%, #f2f2f8 55%, #8a8a98 75%, #d8d8e0 100%)';

export const ChromeNumber: React.FC<{
	size: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({size, style, children}) => {
	return (
		<div
			style={{
				fontFamily: `${FONT_FAMILY.anton}, ${FALLBACK_STACK.sans}`,
				fontSize: size,
				textTransform: 'uppercase',
				letterSpacing: '-0.03em',
				backgroundImage: CHROME_GRADIENT,
				backgroundClip: 'text',
				WebkitBackgroundClip: 'text',
				color: 'transparent',
				WebkitTextFillColor: 'transparent',
				...style,
			}}
		>
			{children}
		</div>
	);
};
