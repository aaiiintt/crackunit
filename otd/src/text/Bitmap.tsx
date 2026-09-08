// §3 "Bitmap": W95FA primary (not sourced this pass, FONTS.md), Silkscreen
// for captions. Rendered at 11px and scaled by INTEGERS only: 22, 33, 44, 55.
// image-rendering: pixelated. Never anti-aliased, never fractional. Dialog
// copy at 33, captions at 44.
import React from 'react';
import {FONT_FAMILY} from '../fonts';

export type BitmapScale = 22 | 33 | 44 | 55;

export const Bitmap: React.FC<{
	scale: BitmapScale;
	color: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({scale, color, style, children}) => {
	return (
		<div
			style={{
				fontFamily: FONT_FAMILY.silkscreen,
				fontSize: scale,
				color,
				letterSpacing: 0,
				imageRendering: 'pixelated',
				// Never anti-aliased — Silkscreen is itself a bitmap-style face so
				// there's no further raster step to control here beyond disabling
				// any smoothing on the box that holds it.
				textAlign: 'left',
				...style,
			}}
		>
			{children}
		</div>
	);
};
