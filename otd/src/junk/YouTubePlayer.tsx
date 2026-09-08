// 2006 YouTube player chrome: grey bar, red play button, and the
// "This video is no longer available" state (H4's hook per §7).
//
// TODO(H4 payoff): the bible's H4 payoff bursts the video's real thumbnail
// through the player at 1.3x (`video.thumbnail`, an i.ytimg.com URL). That
// host is blocked from this sandbox (verified with `curl`, see the report),
// so the payoff here is the post TITLE bursting through the player instead —
// swap in an <Img src={staticFile-or-remote-thumbnail}> once i.ytimg.com is
// reachable from the real render machine.
import React from 'react';
import {PALETTE} from '../palette';
import {Serif} from '../text/Serif';
import {Bitmap} from '../text/Bitmap';

export const YouTubePlayer: React.FC<{
	x: number;
	y: number;
	width?: number;
	height?: number;
	state: 'chrome' | 'unavailable' | 'burst';
	burstText?: string;
	burstScale?: number;
	messageSize?: number;
	style?: React.CSSProperties;
}> = ({x, y, width = 640, height = 480, state, burstText, burstScale = 1, messageSize = 26, style}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				height,
				background: PALETTE.BLACK,
				border: '3px solid #333',
				overflow: 'visible',
				...style,
			}}
		>
			{/* video area */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					bottom: 40,
					background: '#1b1b1b',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{state === 'unavailable' && (
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
						{/* the red play button still shows behind the message — a
						    disabled/greyed-out player, not an empty one, per 2006
						    YouTube's actual "video removed" placeholder */}
						<div
							style={{
								width: messageSize * 2.6,
								height: messageSize * 1.85,
								borderRadius: 10,
								background: '#8a2020',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								opacity: 0.7,
							}}
						>
							<div
								style={{
									width: 0,
									height: 0,
									borderTop: `${messageSize * 0.54}px solid transparent`,
									borderBottom: `${messageSize * 0.54}px solid transparent`,
									borderLeft: `${messageSize * 0.85}px solid #ccc`,
									marginLeft: messageSize * 0.2,
								}}
							/>
						</div>
						<Serif size={messageSize} color="#999" style={{textAlign: 'center', padding: '0 24px'}}>
							This video is no longer available
						</Serif>
					</div>
				)}
				{state === 'chrome' && (
					<div
						style={{
							width: 68,
							height: 48,
							borderRadius: 10,
							background: '#FF0000',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<div
							style={{
								width: 0,
								height: 0,
								borderTop: '14px solid transparent',
								borderBottom: '14px solid transparent',
								borderLeft: `22px solid ${PALETTE.WHITE}`,
								marginLeft: 6,
							}}
						/>
					</div>
				)}
				{state === 'burst' && burstText && (
					<div
						style={{
							transform: `scale(${burstScale})`,
							padding: 16,
						}}
					>
						<Serif size={72} color={PALETTE.WHITE} maxLines={3} maxWidth={width - 32}>
							{burstText}
						</Serif>
					</div>
				)}
			</div>

			{/* grey controller bar */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: 40,
					background: 'linear-gradient(180deg, #4d4d4d, #2b2b2b)',
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					padding: '0 10px',
				}}
			>
				<div
					style={{
						width: 0,
						height: 0,
						borderTop: '7px solid transparent',
						borderBottom: '7px solid transparent',
						borderLeft: `10px solid ${PALETTE.WHITE}`,
					}}
				/>
				<div style={{flex: 1, height: 4, background: '#777', position: 'relative'}}>
					<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: PALETTE.RED}} />
				</div>
				<Bitmap scale={22} color={PALETTE.WHITE}>
					0:00
				</Bitmap>
			</div>
		</div>
	);
};
