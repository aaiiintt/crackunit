// ART-DIRECTION.md §6 "A3 Cascade" (ref 5). Ground WHITE, no screen. Windows
// from the furniture library, copy from the day's own posts (§12 — never
// written for the video). The post image sits in a QuickTime-style player
// window with a grey controller bar. Accepts H2, H6 per §6's table — this
// day's editorial pick (data/lines.json) assigns H1 instead; that's another
// agent's call and out of this file's remit to second-guess, so the hook
// beat here renders H1 (the line) rather than H2 (a dialog).
import React from 'react';
import {staticFile, interpolate, useCurrentFrame} from 'remotion';
import {Camera, Plane, PLANE_Z, CAMERA_REST_Z} from '../scene';
import {PALETTE, type PaletteToken} from '../palette';
import {BEATS} from '../beats';
import {kineticJump, sweep, cascade} from '../moves';
import {MacWindow} from '../junk/MacWindow';
import {ArrowCursor} from '../junk/ArrowCursor';
import {Grotesk} from '../text/Grotesk';
import {Serif} from '../text/Serif';
import {PostTitleOverlay, Chyron, StudioCard} from '../BeatOverlays';
import {Page} from '../page/Page';
import {Sfx} from '../sfx';
import type {DayData, LinePick, Post, ChartEntry} from '../data';

const dolly = (bibleZ: number) => CAMERA_REST_Z - bibleZ;

const BLOCK_COLORS: PaletteToken[] = ['RED', 'BLUE', 'YELLOW'];

export const A3Cascade: React.FC<{
	day: DayData;
	pick: LinePick;
	hero: Post;
	track: ChartEntry;
	renderDate: string;
}> = ({day, pick, hero, track, renderDate}) => {
	const frame = useCurrentFrame();

	const windows = day.posts.slice(0, 12);
	const heroIdx = windows.findIndex((p) => p.permalink === hero.permalink);

	let bibleZ: number;
	if (frame < BEATS.hookEnd) {
		bibleZ = 1400; // f0: one window only, centred
	} else if (frame < BEATS.hookEnd + 6) {
		bibleZ = kineticJump(frame, BEATS.hookEnd, 1400, 1500);
	} else if (frame < BEATS.pageSweepStart) {
		bibleZ = 1500;
	} else if (frame < BEATS.pageSweepEnd) {
		bibleZ = sweep(frame, BEATS.pageSweepStart, 36, 1500, -1630); // f300 sweep36 into the QT window
	} else if (frame < BEATS.pageEnd) {
		bibleZ = interpolate(frame, [BEATS.pageDwellStart, BEATS.pageEnd], [-1630, -1690], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	} else {
		bibleZ = 1500;
	}

	// f6 to f60: cascade of the other 11 windows, camera trucking down 40px
	// per window (§6). Window 0 (the f0 window) is on screen from the start;
	// windows 1-11 cascade in ~5 frames apart to land by f60.
	const CASCADE_SPACING = 5;
	const windowArrival = windows.map((_, i) =>
		i === 0 ? {opacity: 1, scale: 1, visible: true} : cascade(frame, BEATS.hookEnd - 18, i, CASCADE_SPACING),
	);
	const windowsArrivedCount = windowArrival.filter((w) => w.visible).length;
	const truckY = Math.min(windowsArrivedCount, 12) * 40 * (frame < 90 ? 1 : 1); // holds after f60

	// Loop mechanic: the studio-card close box is clicked at f696; every
	// window (1-11; window 0 is the one that must survive to f719) closes in
	// reverse-arrival order, 2 frames apart.
	const closingFrom = 696;
	const closedWindows = windows.map((_, i) => {
		if (i === 0) return false; // the f0 window never closes
		const reverseIndex = windows.length - 1 - i; // last-arrived closes first
		const closeAt = closingFrom + reverseIndex * 2;
		return frame >= closeAt;
	});

	const words = pick.line.split(' ').filter(Boolean);

	const showPost = frame >= BEATS.postStart && frame < BEATS.postEnd;
	const showPage = frame >= BEATS.pageSweepStart && frame < BEATS.pageEnd;
	const showScore = frame >= BEATS.scoreStart && frame < BEATS.scoreEnd;
	const showStudio = frame >= BEATS.studioStart && frame < BEATS.loopStart;
	const showBlocks = frame >= 90 && frame < BEATS.pageSweepStart;

	return (
		<div style={{width: 1080, height: 1920, background: PALETTE.WHITE, position: 'relative', overflow: 'hidden'}}>
			<Camera position={{x: 0, y: -truckY, z: dolly(bibleZ)}}>
				{/* Furniture and Type are hidden during the page reveal — see
				    A1Hero.tsx's comment on this rig's lack of near-plane clipping,
				    which otherwise balloons them past frame size once the camera
				    dollies deep for the far page plane. */}
				{!showPage && <Plane z={PLANE_Z.furniture}>
					{windows.map((post, i) => {
						const arrival = windowArrival[i];
						if (!arrival.visible || closedWindows[i]) return null;
						const isHero = i === heroIdx;
						// Round-two redline item 5: frame 0 is ONE window, centred at
						// 80% frame width, with the line inside it at a fixed 64px —
						// not the autoscale range (this window is a contained,
						// furniture-scale reading, not "the line" at full prominence).
						const isFirstWindow = i === 0;
						const width = isFirstWindow ? 864 : isHero ? 520 : 420;
						const x = isFirstWindow ? (1080 - width) / 2 : 80 + 28 * i;
						const y = isFirstWindow ? 500 : 160 + 36 * i;
						return (
							<div
								key={post.permalink}
								style={{
									opacity: arrival.opacity,
									transform: `scale(${arrival.scale})`,
								}}
							>
								<MacWindow title={post.title} x={x} y={y} width={width}>
									{isFirstWindow ? (
										<Serif size={64} color={PALETTE.BLACK}>
											{pick.line}
										</Serif>
									) : isHero ? (
										<div>
											{post.image && post.image.exists && (
												<div style={{position: 'relative', marginBottom: 10}}>
													<img
														src={staticFile(post.image.src)}
														alt={post.title}
														style={{width: '100%', display: 'block'}}
													/>
													<div
														style={{
															height: 22,
															background: 'linear-gradient(180deg, #4d4d4d, #2b2b2b)',
														}}
													/>
												</div>
											)}
											<Serif size={16} color={PALETTE.BLACK}>
												{post.sentences[0]}
											</Serif>
										</div>
									) : (
										<Serif size={16} color={PALETTE.BLACK}>
											{post.sentences[0] ?? post.title}
										</Serif>
									)}
								</MacWindow>
							</div>
						);
					})}
				</Plane>}

				{!showPage && (
				<Plane z={PLANE_Z.type}>
					{showBlocks && (
						<div
							style={{
								position: 'absolute',
								left: 60,
								bottom: 260,
								display: 'flex',
								flexWrap: 'wrap',
								gap: 8,
								maxWidth: 960,
							}}
						>
							{words.map((word, i) => {
								const block = cascade(frame, 90, i);
								const color = PALETTE[BLOCK_COLORS[i % BLOCK_COLORS.length]];
								return (
									<div
										key={i}
										style={{
											background: color,
											padding: '8px 14px',
											opacity: block.opacity,
											transform: `scale(${block.scale})`,
										}}
									>
										<Grotesk size={40} color={PALETTE.WHITE}>
											{word}
										</Grotesk>
									</div>
								);
							})}
						</div>
					)}
				</Plane>
				)}

				{showPage && (
					<Plane z={PLANE_Z.page}>
						<Page post={hero} />
					</Plane>
				)}
			</Camera>

			{showPost && <PostTitleOverlay title={hero.title} />}
			{showScore && (
				<MacWindow title="New Message" x={80} y={1400} width={520}>
					<Chyron track={track} />
				</MacWindow>
			)}
			{showStudio && (
				<>
					<MacWindow
						title="crackunit"
						x={280}
						y={640}
						width={520}
						closing={frame >= 696 + 22}
					>
						<div style={{height: 400}} />
					</MacWindow>
					{frame >= 690 && frame < 696 && <ArrowCursor x={interpolate(frame, [690, 696], [800, 780 + 20 * 4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} y={650} />}
					<StudioCard date={renderDate} arrivalFrame={BEATS.studioStart} />
				</>
			)}

			<Sfx name="click" atFrame={0} />
			<Sfx name="shutter" atFrame={BEATS.hookEnd} />
			{windows.slice(1).map((_, i) => (
				<Sfx key={i} name="modemChirp" atFrame={BEATS.hookEnd - 18 + (i + 1) * CASCADE_SPACING} playbackRate={1 + i * 0.03} />
			))}
			<Sfx name="whoosh" atFrame={BEATS.pageSweepStart} playbackRate={0.85} />
			<Sfx name="click" atFrame={BEATS.scoreStart} />
			<Sfx name="click" atFrame={BEATS.studioStart} />
			<Sfx name="sting" atFrame={BEATS.studioStart} />
			<Sfx name="click" atFrame={696} />
		</div>
	);
};
