// §3 "Type is an object": every type element gets a hard drop shadow (no
// blur) of 6px at 135deg, BLACK when on BLUE, BLUE when on WHITE.
import {PALETTE} from '../palette';

// 6px at 135deg (measuring clockwise from up, screen convention: down-right)
// decomposes to roughly (4.24, 4.24) — rounded to 4px/4px, a hard shadow with
// zero blur radius.
export const typeShadow = (on: 'BLUE' | 'WHITE' | 'BLACK'): string => {
	const color = on === 'WHITE' ? PALETTE.BLUE : PALETTE.BLACK;
	return `4px 4px 0 ${color}`;
};
