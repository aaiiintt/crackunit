// Label tags: RED / BLUE / YELLOW boxes, W95FA/Bitmap 33, from the day's
// WordPress tags and categories (§12's `copy.tag`) — verbatim, sorted
// shortest first (already done by build-days.mjs).
import React from 'react';
import {PALETTE, type PaletteToken} from '../palette';
import {Bitmap} from '../text/Bitmap';

const TAG_COLORS: PaletteToken[] = ['RED', 'BLUE', 'YELLOW'];

export const LabelTag: React.FC<{
	text: string;
	seedIndex: number;
	x: number;
	y: number;
	style?: React.CSSProperties;
}> = ({text, seedIndex, x, y, style}) => {
	const colorToken = TAG_COLORS[seedIndex % TAG_COLORS.length];
	const bg = PALETTE[colorToken];
	const fg = colorToken === 'YELLOW' ? PALETTE.BLACK : PALETTE.WHITE;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				background: bg,
				padding: '4px 10px',
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			<Bitmap scale={33} color={fg}>
				{text}
			</Bitmap>
		</div>
	);
};
