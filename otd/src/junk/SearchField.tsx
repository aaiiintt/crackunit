// A period-style search box. Text from `copy.search` (titles of the day's
// non-hero posts, lowercased, §12) — never written for the video.
import React from 'react';
import {PALETTE} from '../palette';
import {Bitmap} from '../text/Bitmap';

export const SearchField: React.FC<{
	query: string;
	x: number;
	y: number;
	width?: number;
	style?: React.CSSProperties;
}> = ({query, x, y, width = 420, style}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				display: 'flex',
				alignItems: 'center',
				background: PALETTE.WHITE,
				border: '2px solid #000',
				borderRadius: 4,
				padding: '8px 12px',
				gap: 8,
				...style,
			}}
		>
			<div style={{width: 14, height: 14, borderRadius: '50%', border: `3px solid ${PALETTE.BLACK}`}} />
			<Bitmap scale={22} color={PALETTE.BLACK}>
				{query}
			</Bitmap>
		</div>
	);
};
