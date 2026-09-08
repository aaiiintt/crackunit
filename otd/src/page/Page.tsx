// §8's page beat: "the post rendered as its own page ... a rebuild of that
// year's crackunit template". Since no Wayback captures exist here (the
// brief's instruction), this is a plain, generic 2007-blog rebuild: white
// ground, a Times "crackunit" header, the post date, the title, the body.
//
// Resolution note: §5's plane table calls the page plane "4x resolution",
// §8's beat description says "32px at the plane's 2x resolution" for what
// is nominally 16px Times. Those two numbers disagree; this dry run does
// not implement supersampling at all (it renders directly at the 1080x1920
// design frame, same as every other plane) so it uses the NOMINAL sizes
// §8 gives (16px body, 760px column) rather than either doubled/quadrupled
// pixel figure. A real 4K master pass should decide which number the bible
// meant and rasterise this plane at that multiple for crispness.
import React from 'react';
import {PALETTE} from '../palette';
import {Serif} from '../text/Serif';
import {Mono} from '../text/Mono';
import {renderBody} from './sanitize';
import type {Post} from '../data';

const COLUMN_WIDTH = 760;

const formatDate = (iso: string): string => {
	const d = new Date(iso);
	return d.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'});
};

export const Page: React.FC<{post: Post}> = ({post}) => {
	return (
		<div
			style={{
				width: 1080,
				height: 1920,
				background: PALETTE.WHITE,
				display: 'flex',
				justifyContent: 'center',
			}}
		>
			<div style={{width: COLUMN_WIDTH, paddingTop: 64}}>
				{/* plain 2007-blog header */}
				<div style={{borderBottom: `2px solid ${PALETTE.BLACK}`, paddingBottom: 16, marginBottom: 24}}>
					<Serif size={40} color={PALETTE.BLACK} style={{fontWeight: 700}}>
						crackunit
					</Serif>
					<Mono size={16} color="#666" style={{marginTop: 4}}>
						{formatDate(post.date)}
					</Mono>
				</div>

				<Serif size={28} color={PALETTE.BLACK} style={{fontWeight: 700, marginBottom: 20}}>
					{post.title}
				</Serif>

				<div
					style={{
						fontFamily: `'Liberation Serif', 'Times New Roman', serif`,
						fontSize: 16,
						lineHeight: 1.55,
						color: PALETTE.BLACK,
					}}
				>
					{renderBody(post.bodyHtml)}
				</div>

				<div style={{marginTop: 32, paddingTop: 16, borderTop: '1px solid #ccc'}}>
					<Mono size={14} color="#888">
						{post.categories.join(', ')}
					</Mono>
				</div>
			</div>
		</div>
	);
};
