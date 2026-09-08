// ART-DIRECTION.md §2 "Palette". Hex values verbatim from the bible's table.
// Every colour that appears on screen (outside a photo) must come from here —
// sign-off gate §14 checks this.
export const PALETTE = {
	BLUE: '#1A1AFF',
	MAGENTA: '#FF1FCE',
	ACID: '#C8FF00',
	YELLOW: '#FFE600',
	RED: '#FF2A00',
	CYAN: '#00E5FF',
	WHITE: '#FFFFFF',
	BLACK: '#000000',
	LINK: '#0000EE',
	VISITED: '#551A8B',
} as const;

// §2's six hard bars, no blending, no anti-aliased gradient between them.
export const RAINBOW = ['#FF0000', '#FF8A00', '#FFE600', '#00C800', '#0064FF', '#7A00FF'] as const;

export type PaletteToken = keyof typeof PALETTE;
