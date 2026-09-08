// ART-DIRECTION.md §6 "A4 Window" (refs 2, 12). RAINBOW bars ground at 30deg,
// everything is noise except the Notepad window, which is pristine and IS
// this archetype's page beat (no separate deep page plane). Accepts H1, H2,
// H4 — this dry run only builds H4 (the artefact).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Camera, Plane, PLANE_Z, CAMERA_REST_Z} from '../scene';
import {PALETTE, RAINBOW} from '../palette';
import {BEATS} from '../beats';
import {layerStack} from '../moves';
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

	// The player and Notepad are both sized directly (CSS width/height), not
	// through camera dolly, so the camera just sits at rest throughout —
	// nothing here needs the extra tight-framing dolly the Notepad used to
	// get at the hook (item 3 moved the hook's subject to the player).
	const bibleZ = 1500;

	const noiseArrival = layerStack(frame, BEATS.hookEnd, 0, 12); // f24-60 window
	// Hidden again from f704 so frame 719 matches frame 0's noise-free
	// starkness — §14: "frame 719 differs from frame 0 by one frame of
	// motion and nothing else."
	const noiseOpacity = frame < 704 ? noiseArrival.opacity : 0;

	// Round-two redline item 3: frame 0 is the YouTube player, not the
	// Notepad — 90% frame width, centred. It shrinks into its small "noise"
	// spot (part of the rainbow-noise cluster) over the transition into the
	// payoff, after the title has burst through (f18-26).
	const BIG_PLAYER = {width: 972, height: 730, x: (1080 - 972) / 2, y: 420};
	const SMALL_PLAYER = {width: 260, height: 200, x: 60, y: 60};
	// Shrinks into the noise cluster after the burst (f26-40), then — per
	// §7's H4 loop row ("at f708 the thumbnail shrinks back behind 'no
	// longer available'") — grows back to the big, centred, frame-0 framing
	// over the loop tail, ending one frame short of it at f719 (item 7).
	let playerShrink: number;
	if (frame < 700) {
		playerShrink = interpolate(frame, [26, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	} else {
		playerShrink = interpolate(frame, [700, BEATS.loopEnd], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	}
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
	const player = {
		width: lerp(BIG_PLAYER.width, SMALL_PLAYER.width, playerShrink),
		height: lerp(BIG_PLAYER.height, SMALL_PLAYER.height, playerShrink),
		x: lerp(BIG_PLAYER.x, SMALL_PLAYER.x, playerShrink),
		y: lerp(BIG_PLAYER.y, SMALL_PLAYER.y, playerShrink),
	};
	const playerMessageSize = lerp(48, 26, playerShrink);
	// The burst reverses near the tail too, matching frame 0's "unavailable"
	// reading (not mid-title-burst).
	const playerForceUnavailable = frame >= 700;

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
	// Round-two redline item 3: the Notepad is NOT part of the hook — it
	// comes in at the payoff, right after the title bursts through the
	// player (§6's own text: "the noise arriving by layerStack f24 to f60").
	// It stays at a legible scale throughout (this rig's weak z-parallax at
	// the Furniture plane doesn't deliver hook-grade legibility on its own —
	// z -300 barely magnifies even at a big dolly-in — so scale is driven
	// directly rather than through the camera).
	const notepadVisible = frame >= BEATS.hookEnd && frame < 704;
	// isHook here just means "use the tight f0-equivalent framing" for the
	// loop tail (>=714), so frame 719 matches frame 0 (which has no Notepad
	// at all — both are "hidden", so the framing only matters for the
	// instant it fades back in during payoff on the next loop).
	const isHook = frame < BEATS.hookEnd || frame >= 714;
	const notepadScale = pageDwelling
		? interpolate(frame, [BEATS.pageSweepStart, BEATS.pageSweepStart + 36], [0.55, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
		: 1;

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

				{/* Collage z -600: the OTHER noise — decorative shapes, dithered —
				    fades in by layerStack f24-60. The player itself is rendered
				    separately below: big and alone at the hook, shrinking into
				    this cluster as the noise arrives. */}
				<Plane z={PLANE_Z.collage} style={{opacity: noiseOpacity}}>
					<div style={{position: 'absolute', inset: 0}}>
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

				{/* The YouTube player: 90% frame width and centred at the hook
				    (frame 0), full opacity throughout (not part of the noise
				    fade) — it shrinks into its noise-cluster spot once the title
				    has burst through, then grows back and reverts to
				    "unavailable" over the loop tail so frame 719 matches frame 0
				    (item 7). */}
				<Plane z={PLANE_Z.collage}>
					<HookH4Artefact
						frame={playerForceUnavailable ? 0 : frame}
						title={hero.title}
						x={player.x}
						y={player.y}
						width={player.width}
						height={player.height}
						messageSize={playerMessageSize}
					/>
				</Plane>

				{/* Furniture z -300: the Notepad — pristine, no noise, no screen.
				    Not part of the hook (§6/redline item 3) — arrives at the
				    payoff, right after the burst. */}
				<Plane z={PLANE_Z.furniture} style={{opacity: notepadVisible ? 1 : 0}}>
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
