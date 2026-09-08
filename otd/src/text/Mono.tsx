// §3 "Mono": Courier New Regular, substituted with Liberation Mono
// (FONTS.md). URL 34px, timestamps 22px, HTML texture 14px, ASCII rows 40px.
// Left aligned. Deliberately misaligned baseline between adjacent lines by
// 1-3px — `jitterSeed` picks that per-line offset deterministically.
import React from 'react';
import {FALLBACK_STACK} from '../fonts';
import {makeRng, rngInt} from '../seed';

export const Mono: React.FC<{
	size: number;
	color: string;
	jitterSeed?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({size, color, jitterSeed, style, children}) => {
	const jitter = jitterSeed ? rngInt(makeRng(jitterSeed), 1, 3) : 0;
	return (
		<div
			style={{
				fontFamily: FALLBACK_STACK.mono,
				fontSize: size,
				color,
				textAlign: 'left',
				letterSpacing: 0,
				transform: jitter ? `translateY(${jitter}px)` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};
