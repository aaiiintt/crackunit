// Win98 arrow cursor, rendered as a small nearest-neighbour-scaled SVG
// (2x) so it reads as pixel art rather than a smooth vector arrow.
import React from 'react';
import {PALETTE} from '../palette';

// A classic Win98 arrow silhouette, drawn on an 8x14 pixel grid then scaled
// 2x with pixelated rendering.
const ARROW_PATH =
	'M0,0 L0,12 L3,9 L5,13 L7,12 L5,8 L9,8 Z';

export const ArrowCursor: React.FC<{
	x: number;
	y: number;
	clicking?: boolean;
	style?: React.CSSProperties;
}> = ({x, y, clicking, style}) => {
	const scale = clicking ? 1.8 : 2;
	return (
		<svg
			width={9 * scale}
			height={14 * scale}
			viewBox="0 0 9 14"
			style={{
				position: 'absolute',
				left: x,
				top: y,
				imageRendering: 'pixelated',
				filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.6))',
				...style,
			}}
		>
			<path d={ARROW_PATH} fill={PALETTE.WHITE} stroke={PALETTE.BLACK} strokeWidth={1} />
		</svg>
	);
};
