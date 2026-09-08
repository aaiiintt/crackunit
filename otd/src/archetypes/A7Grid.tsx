// ART-DIRECTION.md §6 "A7 Grid" (ref 9). Ground WHITE with a RED 108px grid
// — "the calmest archetype ... the fallback for anything". No screen. Blocks
// in RED/BLUE/YELLOW/BLACK snap to cells; one specimen, small, inside a
// cell, as if it were a thumbnail. Accepts H1, H5, H6 — this dry run only
// builds H1.
import React from 'react';
import {staticFile, interpolate, useCurrentFrame} from 'remotion';
import {Camera, Plane, PLANE_Z, CAMERA_REST_Z} from '../scene';
import {PALETTE} from '../palette';
import {BEATS} from '../beats';
import {kineticJump, sweep, cascade} from '../moves';
import {RedGrid} from '../junk/RedGrid';
import {Grotesk} from '../text/Grotesk';
import {Mono} from '../text/Mono';
import {HookH1Line} from '../hooks';
import {PostTitleOverlay, Chyron, StudioCard} from '../BeatOverlays';
import {Page} from '../page/Page';
import {Sfx} from '../sfx';
import type {DayData, LinePick, Post, ChartEntry} from '../data';

const dolly = (bibleZ: number) => CAMERA_REST_Z - bibleZ;
const CELL = 108;
// Continuous scroll: 1 cell per 60 frames. The RED grid is a CSS pattern
// tiled every CELL px, so ANY continuous linear scroll wraps invisibly —
// frame 719's offset differs from frame 0's by exactly one frame's worth of
// scroll modulo CELL (see RedGrid.tsx), satisfying §14 without needing a
// bespoke period.
const SCROLL_PX_PER_FRAME = CELL / 60;

export const A7Grid: React.FC<{
	day: DayData;
	pick: LinePick;
	hero: Post;
	track: ChartEntry;
	renderDate: string;
}> = ({day, pick, hero, track, renderDate}) => {
	const frame = useCurrentFrame();

	let bibleZ: number;
	if (frame < BEATS.hookEnd) {
		bibleZ = 1150; // f0 tight on one cell holding the line
	} else if (frame < BEATS.hookEnd + 6) {
		bibleZ = kineticJump(frame, BEATS.hookEnd, 1150, 1500);
	} else if (frame < 90) {
		bibleZ = 1500;
	} else if (frame < 90 + 18) {
		bibleZ = 1500; // f90 sweep18 along a row — a truck, not a dolly; z stays put
	} else if (frame < BEATS.pageSweepStart) {
		bibleZ = 1500;
	} else if (frame < BEATS.pageSweepEnd) {
		bibleZ = sweep(frame, BEATS.pageSweepStart, 36, 1500, -900);
	} else if (frame < BEATS.pageEnd) {
		bibleZ = interpolate(frame, [BEATS.pageDwellStart, BEATS.pageEnd], [-900, -960], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	} else if (frame < BEATS.loopStart) {
		bibleZ = 1500;
	} else {
		bibleZ = interpolate(frame, [BEATS.loopStart, BEATS.loopEnd - 1], [1500, 1150 + (1500 - 1150) / 30], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}

	// f90 sweep18 "along a row" — a horizontal truck.
	const truckX = frame >= 90 && frame < 108 ? sweep(frame, 90, 18, 0, 240) : frame >= 108 && frame < BEATS.pageSweepStart ? 240 : 0;

	const scrollY = frame * SCROLL_PX_PER_FRAME;

	// Hidden again from f704 (matching H1's own loop-mechanic timing) so
	// frame 719 matches frame 0's empty-grid starkness — §14: "frame 719
	// differs from frame 0 by one frame of motion and nothing else."
	const showArchetypeFurniture = frame >= BEATS.hookEnd && frame < 704;
	const showPost = frame >= BEATS.postStart && frame < BEATS.postEnd;
	const showPage = frame >= BEATS.pageSweepStart && frame < BEATS.pageEnd;
	const showScore = frame >= BEATS.scoreStart && frame < BEATS.scoreEnd;
	const showStudio = frame >= BEATS.studioStart && frame < BEATS.loopStart;

	// Blocks cascade onto the grid starting f24, 4 frames apart (§4 cascade).
	const dateBlock = cascade(frame, BEATS.hookEnd, 0);
	const imageBlock = cascade(frame, BEATS.hookEnd, 1);
	const metaBlock = cascade(frame, BEATS.hookEnd, 2);
	const sideBlock = cascade(frame, BEATS.hookEnd, 3);

	return (
		<div style={{width: 1080, height: 1920, background: PALETTE.WHITE, position: 'relative', overflow: 'hidden'}}>
			<Camera position={{x: -truckX, y: 0, z: dolly(bibleZ)}}>
				{/* Hidden during the page reveal: this rig's Planes truly depth-sort
				    in 3D, so once the camera dollies deep for the far page plane,
				    the ground plane (much nearer to the new camera position) blows
				    up and paints over it — see A6Starfield.tsx's longer note. */}
				{!showPage && (
					<Plane z={PLANE_Z.ground}>
						<RedGrid width={1080} height={1920} scrollOffsetPx={scrollY} />
					</Plane>
				)}

				{showArchetypeFurniture && !showPage && (
					<Plane z={PLANE_Z.furniture}>
						{/* YELLOW block: date, title in condensed caps — top row */}
						<div
							style={{
								position: 'absolute',
								left: CELL,
								top: CELL,
								width: CELL * 4,
								height: CELL * 1.5,
								background: PALETTE.YELLOW,
								opacity: dateBlock.opacity,
								transform: `scale(${dateBlock.scale})`,
								padding: 12,
							}}
						>
							<Grotesk size={28} color={PALETTE.BLACK}>
								{new Date(hero.date).toLocaleDateString('en-GB')} — {hero.title}
							</Grotesk>
						</div>

						{/* post image, small, in a cell as a thumbnail */}
						{hero.image && hero.image.exists && (
							<div
								style={{
									position: 'absolute',
									left: CELL,
									top: CELL * 3,
									width: CELL * 2,
									height: CELL * 2,
									opacity: imageBlock.opacity,
									transform: `scale(${imageBlock.scale})`,
									overflow: 'hidden',
									border: `2px solid ${PALETTE.BLACK}`,
								}}
							>
								<img
									src={staticFile(hero.image.src)}
									alt={hero.title}
									style={{width: '100%', height: '100%', objectFit: 'cover'}}
								/>
							</div>
						)}

						{/* mono metadata, bottom left */}
						<div
							style={{
								position: 'absolute',
								left: CELL,
								top: CELL * 11,
								opacity: metaBlock.opacity,
								transform: `scale(${metaBlock.scale})`,
							}}
						>
							<Mono size={22} color={PALETTE.BLACK}>
								{day.copy.status[0]}
							</Mono>
							<Mono size={22} color={PALETTE.BLACK}>
								{day.copy.status[1]}
							</Mono>
						</div>

						{/* BLUE block, bottom right */}
						<div
							style={{
								position: 'absolute',
								right: CELL,
								top: CELL * 11,
								width: CELL * 2,
								height: CELL * 1.5,
								background: PALETTE.BLUE,
								opacity: sideBlock.opacity,
								transform: `scale(${sideBlock.scale})`,
							}}
						/>
					</Plane>
				)}

				{/* Type z -100: the line, RED, across four cells. Hidden during the
				    page reveal — nearer planes balloon past frame size once the
				    camera dollies deep for the far page plane (see A1Hero.tsx's
				    comment on this rig's lack of near-plane clipping). */}
				{!showPage && (
					<Plane z={PLANE_Z.type}>
						<div
							style={{
								position: 'absolute',
								left: 48,
								top: CELL * 5,
								width: 892, // the type safe area's full width — a long line at
								// this compact grid's 64px size needs it to stay within 4
								// lines without truncating (the bible's own diagram shows the
								// line across four ~108px cells, but that's too narrow for
								// several of this dataset's actual lines).
							}}
						>
							<HookH1Line frame={frame} line={pick.line} size={64} maxWidth={892} />
						</div>
					</Plane>
				)}

				{showPage && (
					<Plane z={PLANE_Z.page}>
						<Page post={hero} />
					</Plane>
				)}
			</Camera>

			{showPost && <PostTitleOverlay title={hero.title} />}
			{showScore && <Chyron track={track} />}
			{showStudio && (
				<>
					<div style={{position: 'absolute', inset: 0, background: PALETTE.BLACK}} />
					<StudioCard date={renderDate} arrivalFrame={BEATS.studioStart} />
				</>
			)}

			<Sfx name="click" atFrame={0} />
			<Sfx name="shutter" atFrame={BEATS.hookEnd} />
			<Sfx name="modemChirp" atFrame={BEATS.hookEnd} />
			<Sfx name="modemChirp" atFrame={BEATS.hookEnd + 4} playbackRate={1.06} />
			<Sfx name="modemChirp" atFrame={BEATS.hookEnd + 8} playbackRate={1.12} />
			<Sfx name="modemChirp" atFrame={BEATS.hookEnd + 12} playbackRate={1.19} />
			<Sfx name="whoosh" atFrame={90} />
			<Sfx name="whoosh" atFrame={BEATS.pageSweepStart} playbackRate={0.85} />
			<Sfx name="click" atFrame={BEATS.scoreStart} />
			<Sfx name="click" atFrame={BEATS.studioStart} />
			<Sfx name="sting" atFrame={BEATS.studioStart} />
		</div>
	);
};
