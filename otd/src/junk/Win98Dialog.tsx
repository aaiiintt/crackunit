// Win98-style error/question dialog: title bar, icon, copy, buttons. Copy is
// always a verbatim sentence from `copy.dialog` (§12) — never written for
// the video. Buttons default to a single [OK]; a question sentence gets
// [Yes] [No] (the bible's H2/A6 loop point clicks one of these).
import React from 'react';
import {PALETTE} from '../palette';
import {Bitmap} from '../text/Bitmap';

const WIN_GREY = '#C0C0C0';
const WIN_TITLE_BLUE = PALETTE.BLUE;

export const Win98Dialog: React.FC<{
	text: string;
	buttons: string[];
	title?: string;
	width?: number;
	x: number;
	y: number;
	scale?: number;
	style?: React.CSSProperties;
	highlightButton?: string; // one of `buttons`, drawn pressed/focused
}> = ({text, buttons, title = 'crackunit.exe', width = 480, x, y, scale = 1, style, highlightButton}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				transform: `scale(${scale})`,
				transformOrigin: 'top left',
				background: WIN_GREY,
				border: '2px solid #000',
				boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
				fontFamily: 'inherit',
				...style,
			}}
		>
			{/* title bar */}
			<div
				style={{
					background: `linear-gradient(90deg, ${WIN_TITLE_BLUE}, #0a0a80)`,
					color: PALETTE.WHITE,
					padding: '4px 6px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Bitmap scale={22} color={PALETTE.WHITE}>
					{title}
				</Bitmap>
				<div
					style={{
						width: 18,
						height: 16,
						background: WIN_GREY,
						border: '1px solid #000',
						color: PALETTE.BLACK,
						fontSize: 11,
						textAlign: 'center',
						lineHeight: '14px',
					}}
				>
					×
				</div>
			</div>

			{/* body */}
			<div style={{display: 'flex', gap: 14, padding: 16, alignItems: 'center'}}>
				{/* icon: a plain '!' or '?' badge stands in for the Win98 icon set */}
				<div
					style={{
						flexShrink: 0,
						width: 32,
						height: 32,
						borderRadius: '50%',
						background: buttons.length > 1 ? '#0055ff' : '#ffcc00',
						color: PALETTE.WHITE,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontWeight: 700,
						fontSize: 22,
						border: '2px solid #000',
					}}
				>
					{buttons.length > 1 ? '?' : '!'}
				</div>
				<Bitmap scale={33} color={PALETTE.BLACK} style={{flex: 1}}>
					{text}
				</Bitmap>
			</div>

			{/* buttons */}
			<div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', padding: '0 16px 16px'}}>
				{buttons.map((b) => (
					<div
						key={b}
						style={{
							minWidth: 84,
							padding: '6px 14px',
							textAlign: 'center',
							background: WIN_GREY,
							border: highlightButton === b ? '2px inset #000' : '2px outset #fff',
							boxShadow: '1px 1px 0 #000',
						}}
					>
						<Bitmap scale={22} color={PALETTE.BLACK}>
							{b}
						</Bitmap>
					</div>
				))}
			</div>
		</div>
	);
};
