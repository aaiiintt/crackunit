// §3 "Variable": Anybody (wdth+wght), the only face whose letterforms move.
// wdth animates 50 -> 150 over 18 frames on arrival, settles at 110. Weight
// 700 fixed. Used for the CTA (80px) and the studio-card date (also 80px,
// §8).
import React from 'react';
import {useCurrentFrame, interpolate, Easing} from 'remotion';
import {FONT_FAMILY, FALLBACK_STACK} from '../fonts';

export const CTA: React.FC<{
	size: number;
	color: string;
	arrivalFrame: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({size, color, arrivalFrame, style, children}) => {
	const frame = useCurrentFrame();
	// Overshoot to 150 then settle at 110 over the 18-frame arrival window.
	const wdth = interpolate(
		frame,
		[arrivalFrame, arrivalFrame + 12, arrivalFrame + 18],
		[50, 150, 110],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: Easing.out(Easing.cubic),
		},
	);
	return (
		<div
			style={{
				fontFamily: `${FONT_FAMILY.anybody}, ${FALLBACK_STACK.sans}`,
				fontSize: size,
				color,
				fontVariationSettings: `'wdth' ${wdth}, 'wght' 700`,
				fontWeight: 700,
				...style,
			}}
		>
			{children}
		</div>
	);
};
