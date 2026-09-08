// ART-DIRECTION.md §6 "A4 Window" (refs 2, 12). RAINBOW bars ground at 30deg,
// everything is noise except the Notepad window, which is pristine and IS
// this archetype's page beat (no separate deep page plane). Accepts H1, H2,
// H4 — this dry run only builds H4 (the artefact).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Camera, Plane, PLANE_Z, CAMERA_REST_Z} from '../scene';
import {PALETTE, RAINBOW} from '../palette';
import {BEATS} from '../beats';
import {kineticJump, layerStack} from '../moves';
import {Bayer} from '../junk/Bayer';
import {Notepad} from '../junk/Notepad';
import {Win98Dialog} from '../junk/Win98Dialog';
import {ArrowCursor} from '../junk/ArrowCursor';
import {HookH4Artefact} from '../hooks';
import {PostTitleOverlay, Chyron, StudioCard} from '../BeatOverlays';
import {Sfx} from '../sfx';
import type {DayData, LinePick, Post, ChartEntry} from '../data';

const dolly = (bibleZ: number) => CAMERA_REST_Z - bibleZ;

const RainbowGround: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			background: `repeating-linear-gradient(30deg, ${RAINBOW.map((c, i) => `${c} ${i * 60}px, ${c} ${(i + 1) * 60}px`).join(', ')})`,
		}}
	/>
);

export const A4Window: React.FC<{
	day: DayData;
	pick: LinePick;
	hero: Post;
	track: ChartEntry;
	renderDate: string;
}> = ({day, pick, hero, track, renderDate}) => {
	const frame = useCurrentFrame();

	let bibleZ: number;
	if (frame < BEATS.hookEnd) {
		bibleZ = 1150; // f0 tight on the Notepad
	} else if (frame < BEATS.hookEnd + 6) {
		bibleZ = kineticJump(frame, BEATS.hookEnd, 1150, 1500);
	} else if (frame < 714) {
		bibleZ = 1500;
	} else {
		// loopReturn: motion-matched back toward the f0 tight framing, same
		// device as A1Hero.tsx's camera loop return.
		bibleZ = interpolate(frame, [714, BEATS.loopEnd - 1], [1500, 1150 + (1500 - 1150) / 6], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	}

	const noiseArrival = layerStack(frame, BEATS.hookEnd, 0, 12); // f24-60 window
	// Hidden again from f704 so frame 719 matches frame 0's noise-free
	// starkness — §14: "frame 719 differs from frame 0 by one frame of
	// motion and nothing else."
	const noiseOpacity = frame < 704 ? noiseArrival.opacity : 0;

	const showPost = frame >= BEATS.postStart && frame < BEATS.postEnd;
	const showScore = frame >= BEATS.scoreStart && frame < BEATS.scoreEnd;
	const showStudio = frame >= BEATS.studioStart && frame < BEATS.loopStart;
	const pageDwelling = frame >= BEATS.pageSweepStart && frame < BEATS.pageEnd;

	// This archetype's page beat IS the Notepad: it scrolls to reveal the
	// whole post body across the dwell (§6: "scrolls to reveal the whole
	// post body; this archetype's page beat is the Notepad itself").
	const notepadScroll = pageDwelling
		? interpolate(frame, [BEATS.pageSweepStart, BEATS.pageEnd], [0, Math.max(0, hero.bodyText.length * 0.6 - 400)], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})
		: 0;
	// f0 tight on the Notepad (§6): the hook needs the line legible at the
	// 25% thumbnail, which this rig's weak z-parallax at the Furniture plane
	// doesn't deliver on its own (z -300 barely magnifies even at a big
	// dolly-in) — so the hook framing is boosted directly via scale instead.
	// Also true for the tail of the loop (>=714) so frame 719's Notepad
	// framing matches frame 0's exactly, not just its (by-then-empty) text —
	// §14: "frame 719 differs from frame 0 by one frame of motion and
	// nothing else."
	const isHook = frame < BEATS.hookEnd || frame >= 714;
	const notepadScale = isHook
		? 1
		: pageDwelling
			? interpolate(frame, [BEATS.pageSweepStart, BEATS.pageSweepStart + 36], [0.55, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
			: 0.55;

	// The Notepad shows the line everywhere except the page dwell, where it
	// scrolls the whole post body instead (§6). Loop mechanic: [No] clicked
	// at f702, Notepad text clears line by line (approximated here as a
	// character count winding down), cursor left blinking at f719 exactly as
	// at f0.
	const clearing = frame >= 702;
	const bodyForNotepad = pageDwelling ? hero.bodyText : pick.line;
	const visibleBody = clearing
		? bodyForNotepad.slice(
				0,
				Math.round(
					interpolate(frame, [702, 719], [bodyForNotepad.length, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				),
			)
		: bodyForNotepad;

	return (
		<div style={{width: 1080, height: 1920, position: 'relative', overflow: 'hidden'}}>
			<Camera position={{x: 0, y: 0, z: dolly(bibleZ)}}>
				<Plane z={PLANE_Z.ground}>
					<RainbowGround />
				</Plane>

				{/* Collage z -600: the noise — dithered TV stills / decorative
				    shapes stand-in, plus the H4 YouTube player as one of them. */}
				<Plane z={PLANE_Z.collage} style={{opacity: noiseOpacity}}>
					<div style={{position: 'absolute', inset: 0}}>
						<div style={{position: 'absolute', left: 60, top: 60, width: 260, height: 200}}>
							<HookH4Artefact frame={frame} title={hero.title} x={0} y={0} width={260} height={200} />
						</div>
						<div
							style={{
								position: 'absolute',
								right: 60,
								top: 90,
								width: 160,
								height: 160,
								borderRadius: '50%',
								background: PALETTE.YELLOW,
								border: `4px solid ${PALETTE.BLACK}`,
							}}
						/>
						<Bayer width={1080} height={1920} />
					</div>
				</Plane>

				{/* Furniture z -300: the Notepad — pristine, no noise, no screen. */}
				<Plane z={PLANE_Z.furniture}>
					<Notepad
						title="Untitled - Notepad"
						body={visibleBody}
						x={isHook ? 190 : 90}
						y={isHook ? 760 : pageDwelling ? 500 : 700}
						width={700}
						height={pageDwelling ? 900 : 420}
						scale={notepadScale}
						frame={frame}
						scrollOffsetPx={notepadScroll}
					/>
				</Plane>
			</Camera>

			{showPost && <PostTitleOverlay title={hero.title} />}
			{showScore && <Chyron track={track} />}
			{showStudio && (
				<>
					<Win98Dialog
						text="Save changes to 2007?"
						buttons={['Yes', 'No']}
						title="Notepad"
						x={340}
						y={800}
						highlightButton={frame >= 702 ? 'No' : undefined}
					/>
					{frame >= 702 && frame < 704 && <ArrowCursor x={420} y={940} clicking />}
					<StudioCard date={renderDate} arrivalFrame={BEATS.studioStart} />
				</>
			)}

			<Sfx name="click" atFrame={0} />
			<Sfx name="shutter" atFrame={BEATS.hookEnd} />
			<Sfx name="click" atFrame={BEATS.hookEnd} />
			<Sfx name="click" atFrame={BEATS.scoreStart} />
			<Sfx name="click" atFrame={BEATS.studioStart} />
			<Sfx name="sting" atFrame={BEATS.studioStart} />
			<Sfx name="click" atFrame={702} />
			<Sfx name="dialogChordReverse" atFrame={702} />
		</div>
	);
};
