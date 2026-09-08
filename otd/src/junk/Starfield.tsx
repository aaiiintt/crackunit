// A6's ground: BLACK with a 1999-style starfield (2px WHITE dots),
// seedable by day so a re-render gives the same field.
import React, {useMemo} from 'react';
import {PALETTE} from '../palette';
import {makeRng, rngInt} from '../seed';

export const Starfield: React.FC<{
	seed: string;
	width: number;
	height: number;
	count?: number;
	style?: React.CSSProperties;
}> = ({seed, width, height, count = 260, style}) => {
	const stars = useMemo(() => {
		const rng = makeRng(`${seed}-stars`);
		return Array.from({length: count}, () => ({
			x: rngInt(rng, 0, width),
			y: rngInt(rng, 0, height),
			r: rngInt(rng, 1, 2),
		}));
	}, [seed, width, height, count]);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				background: PALETTE.BLACK,
				...style,
			}}
		>
			<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
				{stars.map((s, i) => (
					<rect key={i} x={s.x} y={s.y} width={s.r} height={s.r} fill={PALETTE.WHITE} />
				))}
			</svg>
		</div>
	);
};
