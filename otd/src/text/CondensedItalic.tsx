// §3 "Condensed italic": Anton with skewX(-12deg). 260-420px cap. Always
// cropped by at least one frame edge — never fully visible — MAGENTA on
// BLUE. The caller is responsible for positioning it so it clips (an
// overflow:hidden ancestor plus a position that pushes it past an edge).
import React from 'react';
import {FONT_FAMILY} from '../fonts';
import {FALLBACK_STACK} from '../fonts';

export const CondensedItalic: React.FC<{
	size: number;
	color: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({size, color, style, children}) => {
	return (
		<div
			style={{
				fontFamily: `${FONT_FAMILY.anton}, ${FALLBACK_STACK.sans}`,
				fontSize: size,
				color,
				textTransform: 'uppercase',
				letterSpacing: '-0.01em',
				transform: 'skewX(-12deg)',
				whiteSpace: 'nowrap',
				...style,
			}}
		>
			{children}
		</div>
	);
};
