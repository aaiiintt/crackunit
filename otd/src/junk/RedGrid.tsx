// A7's ground: RED 1px grid, 108px cells, on WHITE. `scrollOffsetPx` drives
// the loop mechanic (§6: "the grid itself scrolls up 1 cell per 60 frames").
import React from 'react';
import {PALETTE} from '../palette';

const CELL = 108;

export const RedGrid: React.FC<{
	width: number;
	height: number;
	scrollOffsetPx?: number;
	style?: React.CSSProperties;
}> = ({width, height, scrollOffsetPx = 0, style}) => {
	const offset = scrollOffsetPx % CELL;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				background: PALETTE.WHITE,
				backgroundImage: `
					linear-gradient(${PALETTE.RED} 1px, transparent 1px),
					linear-gradient(90deg, ${PALETTE.RED} 1px, transparent 1px)
				`,
				backgroundSize: `${CELL}px ${CELL}px`,
				backgroundPosition: `0 ${-offset}px`,
				width,
				height,
				...style,
			}}
		/>
	);
};
