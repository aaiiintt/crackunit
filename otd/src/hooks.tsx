// §7 "Hooks and their loop mechanics" — the three hooks in this dry run's
// scope (H1, H2, H4), each as a self-contained render for the hook beat
// (f0-24, per §8) plus its own loop-mechanic renderer for the loop beat
// (f690-720). Archetypes place these on whichever plane §6 calls for.
import React from 'react';
import {interpolate} from 'remotion';
import {cursor as cursorMove} from './moves';
import {Win98Dialog} from './junk/Win98Dialog';
import {ArrowCursor} from './junk/ArrowCursor';
import {YouTubePlayer} from './junk/YouTubePlayer';
import {BEATS} from './beats';
import {LineBox, useLineSize, type Ground} from './text/TheLine';

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
	ground?: Ground;
	maxWidth?: number;
	x?: number;
	y?: number;
	style?: React.CSSProperties;
}> = ({frame, line, ground = 'BLUE', maxWidth, x, y, style}) => {
	const [rest, lastWord] = splitLastWord(line);

	// Loop mechanic: from f704 to f719 (15 frames) delete the last word's
	// characters one at a time; retype happens at f0 (the reveal below), so
	// frame 719 shows zero characters of the last word and frame 0 shows it
	// typing back in — motion-matched, never a scale/fade on the whole line
	// (that's what shrank it to ~60px in the first pass: scaling the entire
	// block from 0.7 on arrival, at exactly frame 0, before it had "arrived").
	let visibleLastWord = lastWord;
	if (frame >= 704) {
		const deleteProgress = interpolate(frame, [704, 719], [lastWord.length, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
		visibleLastWord = lastWord.slice(0, Math.round(deleteProgress));
	} else {
		const charCount = Math.round(
			interpolate(frame, [0, 6], [0, lastWord.length], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		);
		visibleLastWord = lastWord.slice(0, charCount);
	}

	// The autofit size is computed from the FULL line (not the partially
	// typed substring) so the size never jumps as characters arrive/delete —
	// LineBox takes that size explicitly rather than computing its own.
	const size = useLineSize(line, maxWidth);

	return (
		<LineBox
			text={`${rest}${visibleLastWord}`}
			size={size}
			ground={ground}
			maxWidth={maxWidth}
			x={x}
			y={y}
			style={style}
		/>
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
	width?: number;
	height?: number;
	bodyScale?: 33 | 44 | 55;
	big?: boolean;
}> = ({frame, text, buttons, x, y, width = 480, height = 180, bodyScale = 33, big = false}) => {
	const okButton = buttons.includes('OK') ? 'OK' : buttons[buttons.length - 1];
	const cursorFrom = {x: x + width - 100, y: y + 40};
	const cursorTo = {x: x + width / 2 - 40, y: y + height - 50};
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
		const w = width;
		const h = height;
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
			<Win98Dialog
				text={text}
				buttons={buttons}
				x={x}
				y={y}
				width={width}
				bodyScale={bodyScale}
				big={big}
				highlightButton={clicked ? okButton : undefined}
			/>
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
	messageSize?: number;
}> = ({frame, title, x, y, width = 640, height = 480, messageSize}) => {
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
			messageSize={messageSize}
		/>
	);
};

export {BEATS};
