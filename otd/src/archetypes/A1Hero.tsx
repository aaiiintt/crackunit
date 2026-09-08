// ART-DIRECTION.md §6 "A1 Hero" (refs 1, 8). Ground BLUE, screen none. A
// condensed-italic headline cropped by the frame edge, a huge falling
// specimen at z -900, the line in Times, a bitmap caption bottom left.
// Accepts H1, H3, H7 — this dry run only builds H1 (the other two are out
// of scope per the brief).
import React from 'react';
import {staticFile, interpolate, useCurrentFrame} from 'remotion';
import {Camera, Plane, PLANE_Z, CAMERA_REST_Z} from '../scene';
import {PALETTE} from '../palette';
import {BEATS} from '../beats';
import {kineticJump, sweep, layerStack, fallingY} from '../moves';
import {Halftone} from '../junk/Halftone';
import {Win98Dialog} from '../junk/Win98Dialog';
import {LabelTag} from '../junk/LabelTag';
import {CondensedItalic} from '../text/CondensedItalic';
import {HookH1Line} from '../hooks';
import {PostTitleOverlay, Chyron, StudioCard} from '../BeatOverlays';
import {Page} from '../page/Page';
import {Sfx} from '../sfx';
import type {DayData, LinePick, Post, ChartEntry} from '../data';

// bible-absolute R3F z -> this rig's relative dolly amount (see scene.tsx's
// doc comment on CAMERA_REST_Z for the derivation).
const dolly = (bibleZ: number) => CAMERA_REST_Z - bibleZ;

const SPECIMEN_HEIGHT = 1344; // 70% of 1920, per §6's diagram
const SPECIMEN_WIDTH = 1000;
// Falling loop: 14px/frame, wrapping every 240 frames. 240 divides 720
// exactly (3 full cycles per video), so the wrap always lands while the
// specimen is off-screen (well above or well below frame — travel band
// 14*240=3360px against a 1920+1344=3264px on/off-screen span) — an
// invisible seam, satisfying §14's "frame 719 differs from frame 0 by one
// frame of motion and nothing else" for this plane.
const FALL_PERIOD = 240;
const FALL_PX_PER_FRAME = 14;

export const A1Hero: React.FC<{
	day: DayData;
	pick: LinePick;
	hero: Post;
	track: ChartEntry;
	renderDate: string;
}> = ({day, pick, hero, track, renderDate}) => {
	const frame = useCurrentFrame();

	// --- camera ------------------------------------------------------------
	let bibleZ: number;
	if (frame < BEATS.hookEnd) {
		bibleZ = 1100; // f0 tight on the specimen
	} else if (frame < BEATS.hookEnd + 6) {
		bibleZ = kineticJump(frame, BEATS.hookEnd, 1100, 1500); // f24 kineticJump to rest
	} else if (frame < 90) {
		bibleZ = 1500;
	} else if (frame < 90 + 24) {
		bibleZ = sweep(frame, 90, 24, 1500, 1300); // f90 sweep24 to the line
	} else if (frame < BEATS.pageSweepStart) {
		bibleZ = 1300;
	} else if (frame < BEATS.pageSweepEnd) {
		bibleZ = sweep(frame, BEATS.pageSweepStart, 36, 1300, -1700); // f300 sweep36 to page
	} else if (frame < BEATS.pageEnd) {
		// f336-480: only the camera moves, 60px total dolly (§8).
		bibleZ = interpolate(frame, [BEATS.pageDwellStart, BEATS.pageEnd], [-1700, -1760], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	} else if (frame < BEATS.loopStart) {
		bibleZ = 1500; // f480 cut back to rest for the chyron; f600 cut to studio card
	} else {
		// f690 loopReturn: motion-matched back toward the f0 tight framing so
		// the camera, like the specimen, is one frame short of f0 at f719.
		bibleZ = interpolate(frame, [BEATS.loopStart, BEATS.loopEnd], [1500, 1100], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}

	// --- specimen fall (A1's own loop mechanic) -----------------------------
	const specimenY = fallingY(frame, -SPECIMEN_HEIGHT, FALL_PX_PER_FRAME, FALL_PERIOD);
	// Item 7's loop check: at frame 0 the specimen is just above frame (one
	// row of it grazing the top edge); at frame 719 it must be the SAME
	// state one frame earlier in that same fall — i.e. also off-screen, not
	// visible at the opposite (bottom) edge. The perspective transform can
	// still paint a transformed element whose flat, pre-transform position
	// is off-screen (3D transforms don't clip the way flat CSS positioning
	// intuition suggests), so visibility is gated explicitly here rather
	// than trusted to the container's overflow:hidden.
	const specimenVisible = specimenY + SPECIMEN_HEIGHT > -20 && specimenY < 1920 + 20;

	// --- furniture, quoted from the day's non-hero posts (§12) --------------
	// Round-two redline item 8: the post beat is culled to AT MOST — the
	// hero photo, the headline, the line, one label-tag cluster, one dialog,
	// one torn shape. The caption and Notepad from the first pass are gone
	// (not on that list); the dialog replaces the Notepad, sized/scaled to
	// meet item 8's own minimums (Silkscreen >=33, >=50% frame width).
	const headline = day.copy.tile;
	const dialogEntry = day.copy.dialog[0];
	const tagCluster = day.copy.tag.slice(0, 3);

	const showPost = frame >= BEATS.postStart && frame < BEATS.postEnd;
	const showPage = frame >= BEATS.pageSweepStart && frame < BEATS.pageEnd;
	const showScore = frame >= BEATS.scoreStart && frame < BEATS.scoreEnd;
	const showStudio = frame >= BEATS.studioStart && frame < BEATS.loopStart;
	// headline/caption/notepad arrive once the hook ends, and disappear again
	// from f704 — the same frame H1's loop mechanic starts deleting the line's
	// last word — so frame 719 matches frame 0's starkness (§14: "frame 719
	// differs from frame 0 by one frame of motion and nothing else").
	const showArchetypeFurniture = frame >= BEATS.hookEnd && frame < 704;

	const headlineArrival = layerStack(frame, BEATS.hookEnd, 0, 0);
	const tagArrival = layerStack(frame, BEATS.hookEnd, 1, 3);
	const jaggedArrival = layerStack(frame, BEATS.hookEnd, 2, 3);
	const dialogArrival = layerStack(frame, BEATS.payoffStart, 0, 3);

	// The line's box is fixed for the whole video (position, width) — only
	// its content changes (typing/deleting the last word). That is what
	// makes it trivially loop-safe (item 7): nothing about its box moves or
	// rescales between frame 0 and frame 719.
	const LINE_X = 48;
	const LINE_Y = 520;

	return (
		<div style={{width: 1080, height: 1920, background: PALETTE.BLUE, position: 'relative', overflow: 'hidden'}}>
			<Camera position={{x: 0, y: 0, z: dolly(bibleZ)}}>
				<Plane z={PLANE_Z.ground} />

				{/* Planes nearer than the page (collage/loop/furniture/type) are
				    hidden once the camera dollies in for the page reveal: a real
				    camera passing z=-900..-300 on its way to -2400 would leave them
				    behind/occluded, but this CSS-transform rig has no true
				    near-plane clipping, so without this guard they balloon to
				    several times frame size and obscure the page (see the report). */}
				{!showPage && (
					<>
						{/* Collage z -600: one jagged RED torn shape (item 8: at most
						    one), halftone screen. */}
						<Plane z={PLANE_Z.collage} style={{opacity: frame < 704 ? jaggedArrival.opacity : 0}}>
							<svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
								<polygon points="120,300 420,260 380,560 90,540" fill={PALETTE.RED} opacity={0.85} />
							</svg>
							<Halftone width={1080} height={1920} />
						</Plane>

						{/* Loop z -900: the falling specimen (hero image), 70% of
						    frame height (item 8). */}
						<Plane z={PLANE_Z.loop}>
							{hero.image && hero.image.exists && specimenVisible ? (
								<img
									src={staticFile(hero.image.src)}
									alt={hero.title}
									style={{
										position: 'absolute',
										left: (1080 - SPECIMEN_WIDTH) / 2,
										top: specimenY,
										width: SPECIMEN_WIDTH,
										height: SPECIMEN_HEIGHT,
										objectFit: 'cover',
										border: `6px solid ${PALETTE.WHITE}`,
									}}
								/>
							) : null}
						</Plane>

						{/* Furniture z -300: item 8's culled set — one label-tag
						    cluster, one dialog (>=50% frame width, Silkscreen >=33). */}
						{showArchetypeFurniture && (
							<Plane z={PLANE_Z.furniture}>
								<div style={{position: 'absolute', left: 48, top: 340, display: 'flex', gap: 6, opacity: tagArrival.opacity}}>
									{tagCluster.map((tag, i) => (
										<LabelTag key={tag} text={tag} seedIndex={i} x={0} y={0} style={{position: 'static'}} />
									))}
								</div>

								{dialogEntry && (
									<div style={{position: 'absolute', opacity: dialogArrival.opacity}}>
										<Win98Dialog
											text={dialogEntry.text}
											buttons={[dialogEntry.button]}
											x={240}
											y={1280}
											width={600}
											bodyScale={33}
										/>
									</div>
								)}
							</Plane>
						)}

						{/* Type z -100: the line (persistent, per H1), headline
						    (cropped by the top edge, per item 8). */}
						<Plane z={PLANE_Z.type}>
							<HookH1Line frame={frame} line={pick.line} x={LINE_X} y={LINE_Y} />

							{showArchetypeFurniture && (
								<div style={{position: 'absolute', top: -40, right: -60, opacity: headlineArrival.opacity}}>
									<CondensedItalic size={320} color={PALETTE.MAGENTA}>
										{headline}
									</CondensedItalic>
								</div>
							)}
						</Plane>
					</>
				)}

				{/* Page z -2400: the post, for the dwell beat. */}
				{showPage && (
					<Plane z={PLANE_Z.page}>
						<Page post={hero} />
					</Plane>
				)}
			</Camera>

			{/* Screen z 0: title / chyron / studio card. Never moves with camera. */}
			{showPost && <PostTitleOverlay title={hero.title} />}
			{showScore && <Chyron track={track} />}
			{showStudio && <StudioCard date={renderDate} arrivalFrame={BEATS.studioStart} />}

			{/* --- sound bed, on the same frame numbers as the picture --- */}
			<Sfx name="click" atFrame={0} />
			<Sfx name="shutter" atFrame={BEATS.hookEnd} />
			<Sfx name="whoosh" atFrame={90} />
			<Sfx name="whoosh" atFrame={BEATS.pageSweepStart} playbackRate={0.85} />
			<Sfx name="click" atFrame={BEATS.scoreStart} />
			<Sfx name="click" atFrame={BEATS.studioStart} />
			<Sfx name="sting" atFrame={BEATS.studioStart} />
		</div>
	);
};
