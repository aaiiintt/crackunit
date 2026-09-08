// Win98-style error/question dialog: title bar, icon, copy, buttons. Copy is
// always a verbatim sentence from `copy.dialog` (§12) — never written for
// the video. Buttons default to a single [OK]; a question sentence gets
// [Yes] [No] (the bible's H2/A6 loop point clicks one of these).
//
// `bodyScale` (round-two redline items 2 and 8): title and buttons always
// render at the SAME Bitmap scale as the body — never smaller, so a dialog
// never carries sub-33px text even where its layout is compact. `big`
// (item 2 specifically: the H2 hook) additionally forces button boxes to
// at least 160x56 and roomier padding throughout.
import React from 'react';
import {PALETTE} from '../palette';
import {Bitmap, type BitmapScale} from '../text/Bitmap';

const WIN_GREY = '#C0C0C0';
const WIN_TITLE_BLUE = PALETTE.BLUE;

const BUTTON_MIN_WIDTH = 160;
const BUTTON_MIN_HEIGHT = 56;

export const Win98Dialog: React.FC<{
	text: string;
	buttons: string[];
	title?: string;
	width?: number;
	x: number;
	y: number;
	scale?: number;
	bodyScale?: BitmapScale;
	big?: boolean;
	style?: React.CSSProperties;
	highlightButton?: string; // one of `buttons`, drawn pressed/focused
}> = ({text, buttons, title = 'crackunit.exe', width = 480, x, y, scale = 1, bodyScale = 33, big = false, style, highlightButton}) => {
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
				border: `${big ? 3 : 2}px solid #000`,
				boxShadow: '6px 6px 0 rgba(0,0,0,0.4)',
				fontFamily: 'inherit',
				...style,
			}}
		>
			{/* title bar */}
			<div
				style={{
					background: `linear-gradient(90deg, ${WIN_TITLE_BLUE}, #0a0a80)`,
					color: PALETTE.WHITE,
					padding: big ? '10px 14px' : '6px 8px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Bitmap scale={bodyScale} color={PALETTE.WHITE}>
					{title}
				</Bitmap>
				<div
					style={{
						width: big ? 36 : 24,
						height: big ? 32 : 22,
						background: WIN_GREY,
						border: '1px solid #000',
						color: PALETTE.BLACK,
						fontSize: big ? 22 : 15,
						textAlign: 'center',
						lineHeight: big ? '28px' : '20px',
					}}
				>
					×
				</div>
			</div>

			{/* body */}
			<div style={{display: 'flex', gap: big ? 28 : 16, padding: big ? 32 : 20, alignItems: 'center'}}>
				{/* icon: a plain '!' or '?' badge stands in for the Win98 icon set */}
				<div
					style={{
						flexShrink: 0,
						width: big ? 64 : 40,
						height: big ? 64 : 40,
						borderRadius: '50%',
						background: buttons.length > 1 ? '#0055ff' : '#ffcc00',
						color: PALETTE.WHITE,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontWeight: 700,
						fontSize: big ? 44 : 26,
						border: `${big ? 4 : 2}px solid #000`,
					}}
				>
					{buttons.length > 1 ? '?' : '!'}
				</div>
				<Bitmap scale={bodyScale} color={PALETTE.BLACK} style={{flex: 1}}>
					{text}
				</Bitmap>
			</div>

			{/* buttons */}
			<div style={{display: 'flex', gap: big ? 20 : 12, justifyContent: 'center', padding: big ? '0 32px 32px' : '0 20px 20px'}}>
				{buttons.map((b) => (
					<div
						key={b}
						style={{
							minWidth: big ? BUTTON_MIN_WIDTH : 96,
							minHeight: big ? BUTTON_MIN_HEIGHT : 44,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: big ? '0 24px' : '0 18px',
							background: WIN_GREY,
							border: highlightButton === b ? '2px inset #000' : '2px outset #fff',
							boxShadow: '2px 2px 0 #000',
						}}
					>
						<Bitmap scale={bodyScale} color={PALETTE.BLACK}>
							{b}
						</Bitmap>
					</div>
				))}
			</div>
		</div>
	);
};
