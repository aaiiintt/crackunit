// The dispatcher: loads the day's data (§8's per-day JSON, plus the shared
// lines.json/charts.json editorial picks) and renders the archetype the
// editorial pick names, with the hook prop it names.
//
// Scope for this dry run: A1 Hero, A3 Cascade, A4 Window, A6 Starfield, A7
// Grid; hooks H1, H2, H4 (per the brief). `data/` and `scripts/build-days.mjs`
// belong to another agent — read only, never written here.
import React from 'react';
import {loadFonts} from './fonts';
import {getDay, getHeroPost, getLinePick, getChartPick} from './data';
import {A1Hero} from './archetypes/A1Hero';
import {A3Cascade} from './archetypes/A3Cascade';
import {A4Window} from './archetypes/A4Window';
import {A6Starfield} from './archetypes/A6Starfield';
import {A7Grid} from './archetypes/A7Grid';

loadFonts();

// The render date is passed in props so a batch rendered in one year for
// posting in the next is still right (§7's note on H5 — not used by this
// dry run's hooks, but the date is also what the studio card shows, so it's
// threaded through regardless).
export const OnThisDay: React.FC<{day: string; renderDate?: string}> = ({day, renderDate}) => {
	const dayData = getDay(day);
	const pick = getLinePick(day);
	const hero = getHeroPost(day);
	const {track} = getChartPick(day);
	const date = renderDate ?? dayData.posts.find((p) => p.permalink === dayData.hero)?.date ?? day;

	const props = {day: dayData, pick, hero, track, renderDate: date};

	switch (pick.archetype) {
		case 'A1':
			return <A1Hero {...props} />;
		case 'A3':
			return <A3Cascade {...props} />;
		case 'A4':
			return <A4Window {...props} />;
		case 'A6':
			return <A6Starfield {...props} />;
		case 'A7':
			return <A7Grid {...props} />;
		default:
			throw new Error(
				`Archetype "${pick.archetype}" (day ${day}) is out of this dry run's scope ` +
					`(A1, A3, A4, A6, A7 only — see the brief).`,
			);
	}
};
