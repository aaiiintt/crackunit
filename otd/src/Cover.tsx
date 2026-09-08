// §10 "The cover": a still, not frame 0. BLUE ground, the archetype's
// collage behind at 30% opacity under a halftone, the date (Anybody 80,
// wdth 110), the line (Times 140 cap, MAGENTA on BLUE, ragged left, max 4
// lines, vertically centred on y 960), a small specimen breaking the safe
// area bottom right, and crackunit.com (Courier 34).
import React from 'react';
import {staticFile} from 'remotion';
import {loadFonts} from './fonts';
import {getDay, getHeroPost, getLinePick} from './data';
import {PALETTE} from './palette';
import {Mono} from './text/Mono';
import {Halftone} from './junk/Halftone';
import {TheLine} from './text/TheLine';

loadFonts();

// §3's variable-face CTA size for the date, at rest (wdth 110) — the cover
// is a still, so there's no arrival animation to play; render the settled
// wdth directly rather than pulling in the frame-driven <CTA>.
const CoverDate: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div
		style={{
			fontFamily: `Anybody, 'Liberation Sans', Arial, sans-serif`,
			fontVariationSettings: `'wdth' 110, 'wght' 700`,
			fontWeight: 700,
			fontSize: 80,
			color: PALETTE.WHITE,
		}}
	>
		{children}
	</div>
);

export const Cover: React.FC<{day: string}> = ({day}) => {
	const dayData = getDay(day);
	const pick = getLinePick(day);
	const hero = getHeroPost(day);
	const dateLabel = new Date(hero.date).toLocaleDateString('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});

	return (
		<div style={{width: 1080, height: 1920, background: PALETTE.BLUE, position: 'relative', overflow: 'hidden'}}>
			{/* the archetype's collage, 30% opacity, under a halftone */}
			<div style={{position: 'absolute', inset: 0, opacity: 0.3}}>
				{hero.image && hero.image.exists ? (
					<img
						src={staticFile(hero.image.src)}
						alt=""
						style={{width: '100%', height: '100%', objectFit: 'cover'}}
					/>
				) : null}
				<Halftone width={1080} height={1920} opacity={0.5} />
			</div>

			<div style={{position: 'absolute', left: 72, top: 340}}>
				<CoverDate>{dateLabel}</CoverDate>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 72,
					top: 960,
					transform: 'translateY(-50%)',
					right: 72,
				}}
			>
				<TheLine text={pick.line} ground="BLUE" maxWidth={936} />
			</div>

			{/* small specimen, bottom right, breaking the safe area on purpose.
			    No specimen asset library exists in this dry run (§13 is out of
			    scope) — the hero image stands in as a cropped thumbnail. */}
			{hero.image && hero.image.exists ? (
				<img
					src={staticFile(hero.image.src)}
					alt=""
					style={{
						position: 'absolute',
						right: -20,
						bottom: 120,
						width: 220,
						height: 220,
						objectFit: 'cover',
						border: `4px solid ${PALETTE.WHITE}`,
					}}
				/>
			) : null}

			<div style={{position: 'absolute', left: 72, top: 1500}}>
				<Mono size={34} color={PALETTE.WHITE}>
					crackunit.com
				</Mono>
			</div>
		</div>
	);
};
