// Shared beats from §8 that every archetype renders the same way, on the
// Screen plane (z 0, "never moves with the camera" per §5): the post title
// during the POST beat, the chyron during the SCORE beat, and the studio
// card during the STUDIO beat. Archetype-specific look (A3's email-compose
// window, A4's Save dialog, A6's URL-titled dialog, A7's black block) is
// layered separately by each archetype file where §6 calls for one;
// everything here is the text and positions §8 fixes regardless of
// archetype.
import React from 'react';
import {PALETTE} from './palette';
import {Grotesk} from './text/Grotesk';
import {Serif} from './text/Serif';
import {Mono} from './text/Mono';
import {Bitmap} from './text/Bitmap';
import {CTA} from './text/CTA';
import {typeShadow} from './text/shadow';
import {TYPE_SAFE} from './safe';
import {STUDIO_CARD} from './beats';
import type {ChartEntry} from './data';

// §8 90-300: title top of safe area, WHITE with BLACK shadow.
export const PostTitleOverlay: React.FC<{title: string}> = ({title}) => {
	return (
		<div style={{position: 'absolute', left: TYPE_SAFE.x0, top: TYPE_SAFE.y0, right: 1080 - TYPE_SAFE.x1}}>
			<Grotesk size={72} color={PALETTE.WHITE} shadowOn="BLUE">
				{title}
			</Grotesk>
		</div>
	);
};

// §8 480-600: "In the charts that week" bitmap 33 over "TRACK by ARTIST"
// Times 48, "No. N" mono 22 beneath, bottom of safe area.
export const Chyron: React.FC<{track: ChartEntry}> = ({track}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: TYPE_SAFE.x0,
				bottom: 1920 - TYPE_SAFE.y1,
				maxWidth: TYPE_SAFE.x1 - TYPE_SAFE.x0,
			}}
		>
			<Bitmap scale={33} color={PALETTE.YELLOW} style={{textShadow: typeShadow('BLUE')}}>
				In the charts that week
			</Bitmap>
			<Serif size={48} color={PALETTE.WHITE} shadowOn="BLUE" style={{marginTop: 6}}>
				{track.title} by {track.artist}
			</Serif>
			<Mono size={22} color={PALETTE.WHITE} style={{marginTop: 6, opacity: 0.85}}>
				No. {track.pos}
			</Mono>
		</div>
	);
};

// §8 600-690: fixed positions, x 72 left aligned: date y700, url y820,
// "link in bio" y900.
export const StudioCard: React.FC<{date: string; arrivalFrame: number}> = ({date, arrivalFrame}) => {
	return (
		<>
			<div style={{position: 'absolute', left: STUDIO_CARD.x, top: STUDIO_CARD.dateY}}>
				<CTA size={80} color={PALETTE.WHITE} arrivalFrame={arrivalFrame}>
					{date}
				</CTA>
			</div>
			<div style={{position: 'absolute', left: STUDIO_CARD.x, top: STUDIO_CARD.urlY}}>
				<Mono size={34} color={PALETTE.WHITE}>
					crackunit.com
				</Mono>
			</div>
			<div style={{position: 'absolute', left: STUDIO_CARD.x, top: STUDIO_CARD.linkInBioY}}>
				<Bitmap scale={33} color={PALETTE.YELLOW}>
					link in bio
				</Bitmap>
			</div>
		</>
	);
};
