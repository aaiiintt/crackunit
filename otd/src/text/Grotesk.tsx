// §3 "Grotesk": Arial Bold, substituted with Liberation Sans Bold (FONTS.md).
// Statements 72-140px, tile words 40px. Caps. Outline treatment:
// -webkit-text-stroke 3px ACID with transparent fill (refs 8, 11), or solid
// fill on colour blocks (ref 5) via the `variant` prop.
import React from 'react';
import {FALLBACK_STACK} from '../fonts';
import {PALETTE} from '../palette';
import {typeShadow} from './shadow';

export const Grotesk: React.FC<{
	size: number;
	color?: string;
	variant?: 'solid' | 'outline';
	shadowOn?: 'BLUE' | 'WHITE' | 'BLACK';
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({size, color = PALETTE.WHITE, variant = 'solid', shadowOn, style, children}) => {
	const outline = variant === 'outline';
	return (
		<div
			style={{
				fontFamily: `'Liberation Sans', ${FALLBACK_STACK.sans}`,
				fontWeight: 700,
				fontSize: size,
				textTransform: 'uppercase',
				letterSpacing: '-0.02em',
				color: outline ? 'transparent' : color,
				WebkitTextStroke: outline ? `3px ${PALETTE.ACID}` : undefined,
				textShadow: shadowOn ? typeShadow(shadowOn) : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};
