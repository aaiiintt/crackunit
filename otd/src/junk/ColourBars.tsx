// SMPTE-ish colour bars strip. §2's RAINBOW token: six hard bars, no
// blending — used here (not true SMPTE colours) to stay inside the palette.
import React from 'react';
import {RAINBOW} from '../palette';

export const ColourBars: React.FC<{
	x: number;
	y: number;
	width: number;
	height: number;
	style?: React.CSSProperties;
}> = ({x, y, width, height, style}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				height,
				display: 'flex',
				...style,
			}}
		>
			{RAINBOW.map((c, i) => (
				<div key={i} style={{flex: 1, background: c}} />
			))}
		</div>
	);
};
