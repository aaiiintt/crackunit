// §3 "Serif": Times New Roman Regular + Italic, substituted with Liberation
// Serif per FONTS.md (metric-compatible, same line breaks). Used for: the
// line (96-220px cap), window copy (26px), site index (64px), chyron track
// title (48px).
import React from 'react';
import {FALLBACK_STACK} from '../fonts';
import {typeShadow} from './shadow';

export const Serif: React.FC<{
	size: number;
	color: string;
	italic?: boolean;
	shadowOn?: 'BLUE' | 'WHITE' | 'BLACK';
	tracking?: number;
	maxWidth?: number;
	maxLines?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({size, color, italic, shadowOn, tracking, maxWidth, maxLines, style, children}) => {
	// §3: -0.04em tracking above 96px, 0 below.
	const letterSpacing = tracking ?? (size > 96 ? '-0.04em' : '0em');
	return (
		<div
			style={{
				fontFamily: FALLBACK_STACK.serif,
				fontStyle: italic ? 'italic' : 'normal',
				fontSize: size,
				lineHeight: 1.05,
				color,
				letterSpacing,
				textAlign: 'left', // "ragged left ... never centred" — §3
				maxWidth,
				display: maxLines ? '-webkit-box' : undefined,
				WebkitLineClamp: maxLines,
				WebkitBoxOrient: maxLines ? 'vertical' : undefined,
				overflow: maxLines ? 'hidden' : undefined,
				textShadow: shadowOn ? typeShadow(shadowOn) : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};
