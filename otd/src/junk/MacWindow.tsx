// Mac-OS-X-ish window chrome for A3 Cascade: traffic-light buttons, title
// bar, Times copy inside. Copy from the day's copy bank (subject, notepad,
// dialog per §12) — never written for the video.
import React from 'react';
import {PALETTE} from '../palette';
import {Serif} from '../text/Serif';

export const MacWindow: React.FC<{
	title: string;
	children: React.ReactNode;
	x: number;
	y: number;
	width?: number;
	closing?: boolean; // studio-card loop mechanic: window closes
	style?: React.CSSProperties;
}> = ({title, children, x, y, width = 460, closing, style}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				background: '#ECECEC',
				borderRadius: 8,
				border: '1px solid #999',
				boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
				overflow: 'hidden',
				transform: closing ? 'scale(0.05)' : 'scale(1)',
				transformOrigin: 'top left',
				transition: 'none',
				...style,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					padding: '8px 10px',
					background: 'linear-gradient(180deg, #f4f4f4, #d8d8d8)',
					borderBottom: '1px solid #aaa',
				}}
			>
				<div style={{width: 12, height: 12, borderRadius: '50%', background: '#FF5F57'}} />
				<div style={{width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E'}} />
				<div style={{width: 12, height: 12, borderRadius: '50%', background: '#28C840'}} />
				<Serif size={16} color="#333" style={{flex: 1, textAlign: 'center'}}>
					{title}
				</Serif>
			</div>
			<div style={{padding: 16, background: PALETTE.WHITE}}>{children}</div>
		</div>
	);
};
