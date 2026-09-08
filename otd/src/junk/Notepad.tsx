// Notepad window chrome: title bar, menu row, plain text body, blinking
// caret. Copy from `copy.notepad` (the hero's excerpt, or a short non-hero
// body, §12) — never written for the video.
import React from 'react';
import {PALETTE} from '../palette';
import {Bitmap} from '../text/Bitmap';
import {Serif} from '../text/Serif';

export const Notepad: React.FC<{
	body: string;
	title?: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
	scale?: number;
	// Real Notepad blink is 530ms; at 60fps that's ~32 frames — the bible
	// rounds this to "2 frames on, 28 off" (30-frame cycle). `frame` lets the
	// caller drive the blink from the composition's clock.
	frame?: number;
	scrollOffsetPx?: number;
	style?: React.CSSProperties;
}> = ({body, title = 'Untitled - Notepad', x, y, width = 620, height = 260, scale = 1, frame = 0, scrollOffsetPx = 0, style}) => {
	const cycle = frame % 30;
	const caretOn = cycle < 2;

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				transform: `scale(${scale})`,
				transformOrigin: 'top left',
				background: '#C0C0C0',
				border: '2px solid #000',
				boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
				...style,
			}}
		>
			<div
				style={{
					background: `linear-gradient(90deg, ${PALETTE.BLUE}, #0a0a80)`,
					color: PALETTE.WHITE,
					padding: '4px 6px',
				}}
			>
				<Bitmap scale={22} color={PALETTE.WHITE}>
					{title}
				</Bitmap>
			</div>
			<div style={{background: '#C0C0C0', padding: '2px 6px', borderBottom: '1px solid #808080'}}>
				<Bitmap scale={22} color={PALETTE.BLACK}>
					File  Edit  Search  Help
				</Bitmap>
			</div>
			<div
				style={{
					background: PALETTE.WHITE,
					height,
					overflow: 'hidden',
					padding: 12,
					position: 'relative',
				}}
			>
				<div style={{transform: `translateY(${-scrollOffsetPx}px)`}}>
					<Serif size={26} color={PALETTE.BLACK}>
						{body}
						<span
							style={{
								display: 'inline-block',
								width: 2,
								height: 24,
								background: PALETTE.BLACK,
								marginLeft: 2,
								verticalAlign: 'text-bottom',
								opacity: caretOn ? 1 : 0,
							}}
						/>
					</Serif>
				</div>
			</div>
		</div>
	);
};
