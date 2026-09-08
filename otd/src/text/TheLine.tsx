// "The line" as its own component — round-two redline: autoscale 220 down
// to 140px cap (§3 amendment), MAGENTA on BLUE / BLACK on WHITE, ragged
// left, never cropped by the frame edge, never truncated, hard 6px shadow.
// Used at the hook (whole line) and wherever else "the line" appears at
// full prominence (the post beat).
import React, {useMemo} from 'react';
import {FALLBACK_STACK} from '../fonts';
import {PALETTE} from '../palette';
import {autoFitSize} from './autoFit';
import {TYPE_SAFE} from '../safe';

export type Ground = 'BLUE' | 'WHITE';

export const SAFE_WIDTH = TYPE_SAFE.x1 - TYPE_SAFE.x0; // 892

export const lineColor = (ground: Ground): string => (ground === 'WHITE' ? PALETTE.BLACK : PALETTE.MAGENTA);
const shadowColor = (ground: Ground): string => (ground === 'WHITE' ? PALETTE.BLUE : PALETTE.BLACK);

// Computes the autoscaled size for a fixed piece of text — callers that
// reveal the text progressively (typing, deleting) must feed this the FULL
// final string, not the in-progress substring, or the size will visibly
// jump as characters arrive. See HookH1Line in hooks.tsx.
export const useLineSize = (line: string, maxWidth: number = SAFE_WIDTH): number =>
	useMemo(
		() => autoFitSize(line, {maxWidth, fontFamily: `'Liberation Serif', 'Times New Roman', serif`}),
		[line, maxWidth],
	);

// The bare rendering box at an explicit, already-decided size — no
// transform, ever (a scale/translate here is what cropped "This" off the
// left edge in the first pass). Renders in normal flow (the caller
// positions it — absolutely at a given x/y, or via a flex-centred wrapper)
// unless `x`/`y` are given, in which case it positions itself absolutely.
export const LineBox: React.FC<{
	text: string;
	size: number;
	ground: Ground;
	maxWidth?: number;
	x?: number;
	y?: number;
	style?: React.CSSProperties;
}> = ({text, size, ground, maxWidth = SAFE_WIDTH, x, y, style}) => (
	<div
		style={{
			...(x !== undefined || y !== undefined ? {position: 'absolute', left: x, top: y} : null),
			width: maxWidth,
			fontFamily: FALLBACK_STACK.serif,
			fontSize: size,
			lineHeight: 1.05,
			letterSpacing: size > 96 ? '-0.04em' : '0em',
			color: lineColor(ground),
			textAlign: 'left',
			textShadow: `6px 6px 0 ${shadowColor(ground)}`,
			...style,
		}}
	>
		{text}
	</div>
);

export const TheLine: React.FC<{
	text: string;
	ground: Ground;
	maxWidth?: number;
	x?: number;
	y?: number;
	style?: React.CSSProperties;
}> = ({text, ground, maxWidth, x, y, style}) => {
	const size = useLineSize(text, maxWidth);
	return <LineBox text={text} size={size} ground={ground} maxWidth={maxWidth} x={x} y={y} style={style} />;
};
