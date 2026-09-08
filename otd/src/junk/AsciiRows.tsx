// ASCII rows: Courier New 40px, WHITE, scrolling 1px/frame. Content from
// `copy.status` (real metadata, §12) interleaved with "0" runs, per the
// bible's A6 diagram ("00000000000 [ turning ] 0000").
import React from 'react';
import {Mono} from '../text/Mono';
import {makeRng, rngInt} from '../seed';

export const AsciiRows: React.FC<{
	status: string[];
	seed: string;
	rows?: number;
	x: number;
	y: number;
	width: number;
	color: string;
	scrollOffsetPx?: number;
	style?: React.CSSProperties;
}> = ({status, seed, rows = 4, x, y, width, color, scrollOffsetPx = 0, style}) => {
	const rng = makeRng(`${seed}-ascii`);
	const lines: string[] = [];
	for (let i = 0; i < rows; i++) {
		const zeros = '0'.repeat(rngInt(rng, 8, 24));
		const meta = status[i % status.length] ?? '';
		lines.push(i % 2 === 0 ? zeros : `${zeros} ${meta} ${zeros}`);
	}
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				overflow: 'hidden',
				transform: `translateX(${-(scrollOffsetPx % width)}px)`,
				...style,
			}}
		>
			{lines.map((line, i) => (
				<Mono key={i} size={40} color={color} jitterSeed={`${seed}-ascii-${i}`}>
					{line}
				</Mono>
			))}
		</div>
	);
};
