// Static data loading for the dry run. Only the five in-scope days are
// imported — "static import is fine for the dry run" per the brief. The
// real build reads all 366 via staticFile + delayRender; this scaffold does
// not need that yet.
//
// `data/` is owned by another agent — read only, never written here.
import day0908 from '../data/days/09-08.json';
import day0909 from '../data/days/09-09.json';
import day0910 from '../data/days/09-10.json';
import day0911 from '../data/days/09-11.json';
import day0912 from '../data/days/09-12.json';
import lines from '../data/lines.json';
import charts from '../data/charts.json';

export type PostImage = {
	src: string;
	exists?: boolean;
	state: 'local' | 'rescued' | 'dead';
	deadHost?: string;
	rescuedHost?: string;
	remote?: boolean;
};

export type PostVideo = {
	kind: 'youtube' | 'vimeo';
	id: string;
	thumbnail: string | null;
};

export type Post = {
	title: string;
	permalink: string;
	url: string;
	date: string;
	year: number;
	slug: string;
	wpId: number;
	excerpt: string;
	categories: string[];
	tags: string[];
	image: PostImage | null;
	video: PostVideo | null;
	bodyText: string;
	bodyHtml: string;
	bodyChars: number;
	sentences: string[];
};

export type DialogLine = {text: string; button: string; from: string};

export type DayCopy = {
	dialog: DialogLine[];
	search: string[];
	error: string[];
	notepad: string[];
	subject: string[];
	tag: string[];
	tile: string;
	status: string[];
	borrowed?: boolean;
};

export type DayData = {
	day: string;
	empty: boolean;
	posts: Post[];
	hero: string;
	heroIndex: number;
	line: string;
	copy: DayCopy;
};

export type LinePick = {
	hero: string;
	line: string;
	alternates: string[];
	hook: 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7';
	archetype: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';
	why: string;
};

export type ChartEntry = {pos: number; title: string; artist: string; instagramSearch: string};
export type ChartWeek = {
	week: string;
	top: ChartEntry[];
	partial?: boolean;
	verified: boolean;
	source: string;
	pick: ChartEntry;
	pickWhy: string;
};

const DAYS: Record<string, DayData> = {
	'09-08': day0908 as DayData,
	'09-09': day0909 as DayData,
	'09-10': day0910 as DayData,
	'09-11': day0911 as DayData,
	'09-12': day0912 as DayData,
};

const LINES = lines as unknown as Record<string, LinePick | string>;
// The JSON's exact literal shape (one key per calendar date, plus _readme and
// _dayToWeek) isn't worth modelling precisely for a 5-day dry run — narrow at
// the call site instead.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CHARTS = charts as any;

export const getDay = (day: string): DayData => {
	const d = DAYS[day];
	if (!d) {
		throw new Error(
			`On This Day dry run only has data for 09-08..09-12; got "${day}". ` +
				`(data/days/*.json and data/lines.json belong to another agent — ` +
				`this composition only reads them.)`,
		);
	}
	return d;
};

export const getLinePick = (day: string): LinePick => {
	const pick = LINES[day];
	if (!pick || typeof pick === 'string') {
		throw new Error(`No editorial pick in data/lines.json for "${day}"`);
	}
	return pick;
};

export const getHeroPost = (day: string): Post => {
	const d = getDay(day);
	const hero = d.posts.find((p) => p.permalink === d.hero);
	if (!hero) {
		throw new Error(`Hero permalink "${d.hero}" for ${day} not found among its posts`);
	}
	return hero;
};

export const getChartPick = (day: string): {track: ChartEntry; week: string; verified: boolean} => {
	const week: string = CHARTS._dayToWeek[day];
	const entry: ChartWeek = CHARTS[week];
	return {track: entry.pick, week: entry.week, verified: entry.verified};
};
