// ART-DIRECTION.md §6 "A6 Starfield" (ref 12). BLACK ground with a 1999
// starfield, an early-CGI loop (never the glossy one), ASCII rows, a colour
// bars strip, Win98 dialogs quoting the archive, a search field. Accepts
// H2, H5, H6 — this dry run only builds H2.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Camera, Plane, PLANE_Z, CAMERA_REST_Z} from '../scene';
import {PALETTE} from '../palette';
import {BEATS} from '../beats';
import {sweep, cascade, cursor as cursorMove, loopReturn} from '../moves';
import {Starfield} from '../junk/Starfield';
import {AsciiRows} from '../junk/AsciiRows';
import {ColourBars} from '../junk/ColourBars';
import {SearchField} from '../junk/SearchField';
import {Win98Dialog} from '../junk/Win98Dialog';
import {ArrowCursor} from '../junk/ArrowCursor';
import {ChromeNumber} from '../text/ChromeNumber';
import {HookH2Dialog} from '../hooks';
import {PostTitleOverlay, Chyron, StudioCard} from '../BeatOverlays';
import {Page} from '../page/Page';
import {Serif} from '../text/Serif';
import {Sfx} from '../sfx';
import type {DayData, LinePick, Post, ChartEntry} from '../data';

const dolly = (bibleZ: number) => CAMERA_REST_Z - bibleZ;

// A low-poly-ish "disco ball" stand-in: a rotating faceted circle. There is
// no specimen asset library in this dry run (§13 is out of scope) — this is
// a vector placeholder for "the loop" plane.
const LoopSphere: React.FC<{frame: number; x: number; y: number; size: number}> = ({frame, x, y, size}) => {
	const rotation = (frame * 3) % 360; // 360deg per 120 frames — a clean divisor of 720
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: size,
				height: size,
				borderRadius: '50%',
				background: `conic-gradient(from ${rotation}deg, #ccc, #666, #ccc, #999, #ccc, #666, #ccc)`,
				border: `2px solid ${PALETTE.WHITE}`,
			}}
		/>
	);
};

export const A6Starfield: React.FC<{
	day: DayData;
	pick: LinePick;
	hero: Post;
	track: ChartEntry;
	renderDate: string;
}> = ({day, pick, hero, track, renderDate}) => {
	const frame = useCurrentFrame();

	let bibleZ: number;
	if (frame < BEATS.pageSweepStart) {
		bibleZ = 1500;
	} else if (frame < BEATS.pageSweepEnd) {
		bibleZ = sweep(frame, BEATS.pageSweepStart, 36, 1500, -1630);
	} else if (frame < BEATS.pageEnd) {
		bibleZ = interpolate(frame, [BEATS.pageDwellStart, BEATS.pageEnd], [-1630, -1690], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	} else {
		bibleZ = 1500;
	}

	const buttons = pick.line.trim().endsWith('?') ? ['Yes', 'No'] : ['OK'];
	// Round-two redline item 2: the hook dialog is at least 75% of frame
	// width (810px+) and centred in the safe area (x 48-940, y 220-1500).
	const DIALOG_WIDTH = 860;
	const DIALOG_HEIGHT = 340;
	const dialogX = (1080 - DIALOG_WIDTH) / 2;
	const dialogY = 220 + (1280 - DIALOG_HEIGHT) / 2;

	const showPost = frame >= BEATS.postStart && frame < BEATS.postEnd;
	const showPage = frame >= BEATS.pageSweepStart && frame < BEATS.pageEnd;
	const showScore = frame >= BEATS.scoreStart && frame < BEATS.scoreEnd;
	const showStudio = frame >= BEATS.studioStart && frame < BEATS.loopStart;

	// Payoff: two more dialogs cascade in from the day's non-hero copy bank.
	const extra1 = cascade(frame, BEATS.hookEnd, 0, 12);
	const extra2 = cascade(frame, BEATS.hookEnd, 1, 12);
	const dialogCopy = day.copy.dialog.filter((d) => d.text !== pick.line).slice(0, 2);

	// feedbackTunnel stand-in from f90: the year, chrome Impact/Anton, with a
	// few faded, slightly-larger echo copies behind it approximating a
	// render-feedback trail (this DOM rig has no access to the previous
	// frame's pixels, so it's approximated rather than a literal feedback
	// loop — documented deviation).
	const showFeedback = frame >= 90 && frame < BEATS.postStart;
	const year = hero.year;

	// H2's studio-card loop mechanic, A6-specific numbers: [OK] clicked at
	// f702, closes, the f0 dialog reopens by cascade at f714, cursor returns
	// to its f0 position by f719.
	const cursorFrom = {x: dialogX + DIALOG_WIDTH - 100, y: dialogY + 40};
	const cursorTo = {x: dialogX + DIALOG_WIDTH / 2 - 40, y: dialogY + DIALOG_HEIGHT - 50};
	const studioCursor = cursorMove(frame, 690, cursorFrom, cursorTo);
	const reopenArrival = frame >= 714;
	const cursorReturnX = frame >= 714 ? loopReturn(frame, 714, 720, studioCursor.x, cursorFrom.x) : studioCursor.x;
	const cursorReturnY = frame >= 714 ? loopReturn(frame, 714, 720, studioCursor.y, cursorFrom.y) : studioCursor.y;

	return (
		<div style={{width: 1080, height: 1920, background: PALETTE.BLACK, position: 'relative', overflow: 'hidden'}}>
			<Camera position={{x: 0, y: 0, z: dolly(bibleZ)}}>
				{/* The ground plane is hidden during the page reveal too: this
				    rig's Planes really do depth-sort in 3D (transform-style:
				    preserve-3d), so once the camera dollies deep enough to bring
				    the far page plane (z -2400) to a normal reading size, the
				    ground plane (z -1400) — much nearer to the new camera position
				    — blows up even larger and paints over the page entirely. */}
				{!showPage && (
					<Plane z={PLANE_Z.ground}>
						<Starfield seed={day.day} width={1080} height={1920} />
					</Plane>
				)}

				{/* Nearer planes (loop/furniture/type) are hidden during the page
				    reveal — see A1Hero.tsx's comment on this rig's lack of
				    near-plane clipping, which otherwise balloons them past frame
				    size once the camera dollies deep for the far page plane. */}
				{!showPage && (
					<>
						<Plane z={PLANE_Z.loop}>
							<LoopSphere frame={frame} x={390} y={520} size={300} />
						</Plane>

						<Plane z={PLANE_Z.furniture}>
							<ColourBars x={80} y={1000} width={280} height={24} />
							<AsciiRows
								status={day.copy.status}
								seed={day.day}
								rows={3}
								x={40}
								y={860}
								width={1000}
								color={PALETTE.WHITE}
								scrollOffsetPx={frame * 1}
							/>
							<SearchField query={day.copy.search[0] ?? ''} x={80} y={1700} />

							{/* payoff: two extra dialogs, cascading in */}
							{frame >= BEATS.hookEnd && frame < BEATS.scoreStart && dialogCopy[0] && (
								<div style={{opacity: extra1.opacity, transform: `scale(${extra1.scale})`}}>
									<Win98Dialog text={dialogCopy[0].text} buttons={[dialogCopy[0].button]} x={120} y={620} width={380} />
								</div>
							)}
							{frame >= BEATS.hookEnd && frame < BEATS.scoreStart && dialogCopy[1] && (
								<div style={{opacity: extra2.opacity, transform: `scale(${extra2.scale})`}}>
									<Win98Dialog text={dialogCopy[1].text} buttons={[dialogCopy[1].button]} x={620} y={1260} width={380} />
								</div>
							)}
						</Plane>

						<Plane z={PLANE_Z.type}>
							{showFeedback && (
								<div
									style={{
										position: 'absolute',
										inset: 0,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<div style={{position: 'relative'}}>
										<div style={{position: 'absolute', inset: -24, opacity: 0.18, transform: 'scale(1.12)'}}>
											<ChromeNumber size={400}>{year}</ChromeNumber>
										</div>
										<div style={{position: 'absolute', inset: -12, opacity: 0.32, transform: 'scale(1.06)'}}>
											<ChromeNumber size={400}>{year}</ChromeNumber>
										</div>
										<ChromeNumber size={400}>{year}</ChromeNumber>
									</div>
								</div>
							)}

							{/* the hook dialog / its H2 shatter-and-reassemble */}
							{frame < 690 && (
								<HookH2Dialog
									frame={frame}
									text={pick.line}
									buttons={buttons}
									x={dialogX}
									y={dialogY}
									width={DIALOG_WIDTH}
									height={DIALOG_HEIGHT}
									bodyScale={44}
								/>
							)}

							{/* studio-card loop mechanic */}
							{frame >= 690 && (
								<>
									{!reopenArrival && (
										<Win98Dialog
											text={hero.url}
											buttons={['OK']}
											title={hero.url}
											x={dialogX}
											y={dialogY}
											width={DIALOG_WIDTH}
											bodyScale={44}
										big
											highlightButton={frame >= 702 ? 'OK' : undefined}
										/>
									)}
									{reopenArrival && (
										<HookH2Dialog
											frame={0}
											text={pick.line}
											buttons={buttons}
											x={dialogX}
											y={dialogY}
											width={DIALOG_WIDTH}
											height={DIALOG_HEIGHT}
											bodyScale={44}
										big
										/>
									)}
									<ArrowCursor x={cursorReturnX} y={cursorReturnY} clicking={frame >= 702 && frame < 704} />
								</>
							)}
						</Plane>
					</>
				)}

				{showPage && (
					<Plane z={PLANE_Z.page}>
						{/* "sweep 36 into a browser window ... which is the page" — a
						    minimal period browser chrome wraps the page plane. */}
						<div style={{position: 'absolute', inset: 0, background: '#ECECEC'}}>
							<div
								style={{
									height: 48,
									background: '#D8D8D8',
									display: 'flex',
									alignItems: 'center',
									padding: '0 16px',
									borderBottom: '1px solid #999',
								}}
							>
								<Serif size={20} color={PALETTE.BLACK}>
									{hero.url}
								</Serif>
							</div>
							<Page post={hero} />
						</div>
					</Plane>
				)}
			</Camera>

			{showPost && <PostTitleOverlay title={hero.title} />}
			{showScore && <Chyron track={track} />}
			{showStudio && <StudioCard date={renderDate} arrivalFrame={BEATS.studioStart} />}

			<Sfx name="click" atFrame={0} />
			<Sfx name="click" atFrame={18} />
			<Sfx name="dialogChord" atFrame={BEATS.hookEnd} />
			<Sfx name="dialogChord" atFrame={BEATS.hookEnd + 12} playbackRate={1.1} />
			<Sfx name="whoosh" atFrame={BEATS.pageSweepStart} playbackRate={0.85} />
			<Sfx name="click" atFrame={BEATS.scoreStart} />
			<Sfx name="click" atFrame={BEATS.studioStart} />
			<Sfx name="sting" atFrame={BEATS.studioStart} />
			<Sfx name="click" atFrame={702} />
			<Sfx name="dialogChordReverse" atFrame={702} />
			<Sfx name="dialogChord" atFrame={714} />
		</div>
	);
};
