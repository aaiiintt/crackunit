// Minimal sanitiser + renderer for `bodyHtml` (§8's page beat: "the post
// body ... in a rebuild of that year's crackunit template"). Despite the
// field name, this export's actual content is a mix of raw HTML (mostly
// <iframe> video embeds) and Markdown-ish syntax (![alt](src) images,
// [text](url) links, > blockquotes, **bold**, numbered lists) — that is
// what `export-wp.mjs` produces upstream (another agent's script, not
// touched here). This renders it down to exactly the allow-listed tags the
// brief specifies: p, a, img, blockquote, ul/ol, strong/em. No dependency —
// the brief says no new ones — this is a small hand-rolled pass, not a full
// Markdown engine.
import React from 'react';
import {PALETTE} from '../palette';

// Strip <script>...</script> and <iframe>...</iframe> (paired or
// self-closing) entirely, per the brief's sanitise rule. These are the only
// two raw tags that show up in this dataset (video embeds); nothing else
// needs a tag-level strip.
const stripDangerousTags = (html: string): string =>
	html
		.replace(/<script[\s\S]*?<\/script\s*>/gi, '')
		.replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, '')
		.replace(/<iframe[^>]*\/?>/gi, '');

// Un-escape the backslash-escaped brackets export-wp.mjs sometimes leaves
// behind (e.g. "\[10.09.09\]") so they read as literal text, not link
// syntax.
const unescapeBrackets = (s: string): string => s.replace(/\\([[\]])/g, '$1');

let linkCounter = 0;

const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
	const nodes: React.ReactNode[] = [];
	// Order matters: images before links (image syntax is a superset,
	// ![alt](url), of the link syntax), then bold, then italic.
	const pattern =
		/!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]*)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let i = 0;
	while ((match = pattern.exec(text))) {
		if (match.index > lastIndex) {
			nodes.push(unescapeBrackets(text.slice(lastIndex, match.index)));
		}
		const key = `${keyPrefix}-${i++}`;
		if (match[1] !== undefined) {
			// image
			nodes.push(
				<img
					key={key}
					src={match[2]}
					alt={match[1]}
					style={{maxWidth: '100%', height: 'auto', display: 'block', margin: '12px 0'}}
				/>,
			);
		} else if (match[3] !== undefined) {
			// link
			const isVisited = linkCounter % 2 === 1;
			linkCounter++;
			nodes.push(
				<a
					key={key}
					href={match[4]}
					style={{
						color: isVisited ? PALETTE.VISITED : PALETTE.LINK,
						textDecoration: 'underline',
					}}
				>
					{unescapeBrackets(match[3])}
				</a>,
			);
		} else if (match[5] !== undefined) {
			nodes.push(<strong key={key}>{unescapeBrackets(match[5])}</strong>);
		} else if (match[6] !== undefined) {
			nodes.push(<em key={key}>{unescapeBrackets(match[6])}</em>);
		} else if (match[7] !== undefined) {
			nodes.push(<em key={key}>{unescapeBrackets(match[7])}</em>);
		}
		lastIndex = pattern.lastIndex;
	}
	if (lastIndex < text.length) {
		nodes.push(unescapeBrackets(text.slice(lastIndex)));
	}
	return nodes;
};

const ORDERED_ITEM = /^\d+\.\s+/;

export const renderBody = (bodyHtml: string): React.ReactNode => {
	linkCounter = 0; // reset per post so "the second link" is per-post, not global
	const cleaned = stripDangerousTags(bodyHtml);
	const blocks = cleaned
		.split(/\n{2,}/)
		.map((b) => b.trim())
		.filter(Boolean);

	const elements: React.ReactNode[] = [];
	let pendingOl: string[] = [];

	const flushOl = (key: string) => {
		if (pendingOl.length) {
			elements.push(
				<ol key={key} style={{margin: '12px 0', paddingLeft: 28}}>
					{pendingOl.map((item, i) => (
						<li key={i} style={{marginBottom: 4}}>
							{renderInline(item.replace(ORDERED_ITEM, ''), `${key}-li-${i}`)}
						</li>
					))}
				</ol>,
			);
			pendingOl = [];
		}
	};

	blocks.forEach((block, bi) => {
		const lines = block.split('\n').map((l) => l.trim());
		const isOrderedList = lines.every((l) => ORDERED_ITEM.test(l));

		if (isOrderedList && lines.length > 0) {
			pendingOl.push(...lines);
			return;
		}
		flushOl(`ol-${bi}`);

		if (block.startsWith('>')) {
			const quote = block
				.split('\n')
				.map((l) => l.replace(/^>+\s?/, ''))
				.join(' ');
			elements.push(
				<blockquote
					key={bi}
					style={{
						margin: '16px 0',
						paddingLeft: 16,
						borderLeft: `3px solid ${PALETTE.BLACK}`,
						fontStyle: 'italic',
					}}
				>
					{renderInline(quote, `bq-${bi}`)}
				</blockquote>,
			);
			return;
		}

		// A block that is ONLY an image renders as a bare <img>, not wrapped in
		// a <p> — matches "inline images at their original size" without the
		// extra paragraph box model around them.
		const soloImage = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
		if (soloImage) {
			elements.push(
				<img
					key={bi}
					src={soloImage[2]}
					alt={soloImage[1]}
					style={{maxWidth: '100%', height: 'auto', display: 'block', margin: '16px 0'}}
				/>,
			);
			return;
		}

		elements.push(
			<p key={bi} style={{margin: '0 0 16px'}}>
				{renderInline(block, `p-${bi}`)}
			</p>,
		);
	});
	flushOl('ol-final');

	return elements;
};
