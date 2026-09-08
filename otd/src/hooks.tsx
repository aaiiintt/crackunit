// §7 "Hooks and their loop mechanics" — the three hooks in this dry run's
// scope (H1, H2, H4), each as a self-contained render for the hook beat
// (f0-24, per §8) plus its own loop-mechanic renderer for the loop beat
// (f690-720). Archetypes place these on whichever plane §6 calls for.
import React from 'react';
import {interpolate} from 'remotion';
import {PALETTE} from './palette';
import {Serif} from './text/Serif';
import {typeIn, cursor as cursorMove} from './moves';
import {Win98Dialog} from './junk/Win98Dialog';
import {ArrowCursor} from './junk/ArrowCursor';
import {YouTubePlayer} from './junk/YouTubePlayer';
import {BEATS} from './beats';

// ---------------------------------------------------------------------------
// H1 — The line. Frame 0: the line alone, Times, MAGENTA on BLUE, nothing
// else. Last word arrives by typeIn at f6. Loop mechanic: the last word is
// deleted character by character from f704 and retyped at f0 (so f719 is one
// frame of motion before f0).
// ---------------------------------------------------------------------------
const splitLastWord = (line: string): [string, string] => {
	const trimmed = line.trimEnd();
	const idx = trimmed.lastIndexOf(' ');
	if (idx === -1) return ['', trimmed];
	return [trimmed.slice(0, idx + 1), trimmed.slice(idx + 1)];
};

export const HookH1Line: React.FC<{
	frame: number;
	line: string;
	size?: number;
	maxWidth?: number;
}> = ({frame, line, size = 140, maxWidth = 900}) => {
	const [rest, lastWord] = splitLastWord(line);

	// Loop mechanic: from f704 to f719 (15 frames) delete the last word's
	// characters one at a time; retype happens at f0 via the mirrored typeIn
	// below, so frame 719 shows zero characters of the last word and frame 0
	// (typeIn arrival f0-f6) shows it typing back in — motion-matched, no fade.
	let visibleLastWord = lastWord;
	if (frame >= 704) {
		const deleteProgress = interpolate(frame, [704, 719], [lastWord.length, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		visibleLastWord = lastWord.slice(0, Math.round(deleteProgress));
	} else {
		// Normal playback: last word typeIn's in by f6 (a per-character reveal
		// standing in for the bible's single typeIn arrival on the whole word).
		const charCount = Math.round(
			interpolate(frame, [0, 6], [0, lastWord.length], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		);
		visibleLastWord = lastWord.slice(0, charCount);
	}

	const {scale} = typeIn(Math.min(frame, 6), 0);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'flex-start',
				padding: '0 48px',
			}}
		>
			<div style={{transform: `scale(${scale})`, transformOrigin: 'left center'}}>
				<Serif size={size} color={PALETTE.MAGENTA} maxWidth={maxWidth} maxLines={4} shadowOn="BLUE">
					{rest}
					{visibleLastWord}
				</Serif>
			</div>
		</div>
	);
};

// ---------------------------------------------------------------------------
// H2 — The dialog. Win98 error box, the line as its copy, cursor 200px from
// [OK]. Cursor reaches [OK] at f18, clicks; the box shatters into 8
// rectangles that become the collage. Loop mechanic: the studio card is a
// dialog; its [OK] click reassembles the f0 box.
// ---------------------------------------------------------------------------
export const HookH2Dialog: React.FC<{
	frame: number;
	text: string;
	buttons: string[];
	x: number;
	y: number;
}> = ({frame, text, buttons, x, y}) => {
	const okButton = buttons.includes('OK') ? 'OK' : buttons[buttons.length - 1];
	const cursorFrom = {x: x + 200, y: y + 40};
	const cursorTo = {x: x + 40, y: y + 130};
	const c = cursorMove(frame, 0, cursorFrom, cursorTo);
	const clicked = frame >= 18;

	// From f18, the dialog shatters into 8 rectangles (a literal grid split of
	// its own bounding box) that fly outward — visually "becomes the
	// collage" per §7.
	const shatterProgress = interpolate(frame, [18, 24], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	if (shatterProgress > 0) {
		const w = 480;
		const h = 180;
		const cellW = w / 4;
		const cellH = h / 2;
		const pieces = Array.from({length: 8}, (_, i) => {
			const col = i % 4;
			const row = Math.floor(i / 4);
			const angle = (i / 8) * Math.PI * 2;
			const dist = shatterProgress * 260;
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x + col * cellW + Math.cos(angle) * dist,
						top: y + row * cellH + Math.sin(angle) * dist,
						width: cellW,
						height: cellH,
						background: '#C0C0C0',
						border: '1px solid #000',
						opacity: 1 - shatterProgress * 0.4,
						transform: `rotate(${shatterProgress * (i % 2 === 0 ? 45 : -45)}deg)`,
					}}
				/>
			);
		});
		return <>{pieces}</>;
	}

	return (
		<>
			<Win98Dialog text={text} buttons={buttons} x={x} y={y} highlightButton={clicked ? okButton : undefined} />
			<ArrowCursor x={c.x} y={c.y} clicking={c.clicking} />
		</>
	);
};

// ---------------------------------------------------------------------------
// H4 — The artefact. 2006 YouTube player chrome, "This video is no longer
// available". At f18 the thumbnail bursts through the player at 1.3x and
// settles. TODO: i.ytimg.com is blocked from this sandbox (verified with
// curl — see the report), so the payoff bursts the post TITLE through
// instead of the real thumbnail.
// ---------------------------------------------------------------------------
export const HookH4Artefact: React.FC<{
	frame: number;
	title: string;
	x: number;
	y: number;
	width?: number;
	height?: number;
}> = ({frame, title, x, y, width = 640, height = 480}) => {
	const burstScale = interpolate(frame, [18, 22, 26], [1, 1.3, 1.1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const state = frame < 18 ? 'unavailable' : 'burst';
	return (
		<YouTubePlayer
			x={x}
			y={y}
			width={width}
			height={height}
			state={state}
			burstText={title}
			burstScale={state === 'burst' ? burstScale : 1}
		/>
	);
};

export {BEATS};
