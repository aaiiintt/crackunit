// Selection-rectangle with corner handles (A8's marquee). Not used by any
// archetype in this dry run's scope (A1, A3, A4, A6, A7) — kept per the
// brief's "may be unused" instruction, for the A8 build this scaffold does
// not cover.
import React from 'react';
import {PALETTE} from '../palette';

const HANDLE = 8;

export const SelectionRect: React.FC<{
	x: number;
	y: number;
	width: number;
	height: number;
	style?: React.CSSProperties;
}> = ({x, y, width, height, style}) => {
	const corners = [
		{left: -HANDLE / 2, top: -HANDLE / 2},
		{left: width - HANDLE / 2, top: -HANDLE / 2},
		{left: -HANDLE / 2, top: height - HANDLE / 2},
		{left: width - HANDLE / 2, top: height - HANDLE / 2},
	];
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				height,
				border: `2px dashed ${PALETTE.BLACK}`,
				...style,
			}}
		>
			{corners.map((c, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: c.left,
						top: c.top,
						width: HANDLE,
						height: HANDLE,
						background: PALETTE.WHITE,
						border: `1px solid ${PALETTE.BLACK}`,
					}}
				/>
			))}
		</div>
	);
};
