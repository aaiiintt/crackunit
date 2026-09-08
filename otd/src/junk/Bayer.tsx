// §2's "unifying screen", the other option: 1-bit Bayer 4x4 ordered dither.
// Applied ONLY to the collage plane, same rule as Halftone.
import React from 'react';
import {PALETTE} from '../palette';

// The classic 4x4 Bayer threshold matrix, values 0-15.
const BAYER_4X4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
];

const CELL = 6;

export const Bayer: React.FC<{width: number; height: number; opacity?: number}> = ({
	width,
	height,
	opacity = 0.4,
}) => {
	const id = 'bayer-4x4';
	const tile = CELL * 4;
	return (
		<svg
			width={width}
			height={height}
			style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply'}}
		>
			<defs>
				<pattern id={id} width={tile} height={tile} patternUnits="userSpaceOnUse">
					{BAYER_4X4.flatMap((row, r) =>
						row.map((v, c) => {
							// 1-bit: each cell is either fully on or fully off, threshold at
							// the matrix's midpoint — a checkerboard-weighted dither rather
							// than a grey ramp.
							const on = v >= 8;
							return on ? (
								<rect
									key={`${r}-${c}`}
									x={c * CELL}
									y={r * CELL}
									width={CELL}
									height={CELL}
									fill={PALETTE.BLACK}
								/>
							) : null;
						}),
					)}
				</pattern>
			</defs>
			<rect width={width} height={height} fill={`url(#${id})`} opacity={opacity} />
		</svg>
	);
};
