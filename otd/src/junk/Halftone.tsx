// §2's "unifying screen": halftone dot 45deg at 3.2px pitch. Applied ONLY to
// the collage plane (z -600), never to type, UI furniture or the page beat —
// enforced by callers only wrapping the collage plane's content with this.
import React from 'react';
import {PALETTE} from '../palette';

const PITCH = 3.2;

export const Halftone: React.FC<{width: number; height: number; opacity?: number}> = ({
	width,
	height,
	opacity = 0.35,
}) => {
	const id = 'halftone-dots';
	const diagonal = Math.ceil(Math.sqrt(width * width + height * height));
	return (
		<svg
			width={width}
			height={height}
			style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply'}}
		>
			<defs>
				<pattern
					id={id}
					width={PITCH}
					height={PITCH}
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45)"
				>
					<rect width={PITCH} height={PITCH} fill="transparent" />
					<circle cx={PITCH / 2} cy={PITCH / 2} r={PITCH * 0.32} fill={PALETTE.BLACK} />
				</pattern>
			</defs>
			<rect
				x={(width - diagonal) / 2}
				y={(height - diagonal) / 2}
				width={diagonal}
				height={diagonal}
				fill={`url(#${id})`}
				opacity={opacity}
			/>
		</svg>
	);
};
