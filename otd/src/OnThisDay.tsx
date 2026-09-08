// Placeholder composition for the on-this-day dry run.
//
// This proves two things the real build depends on, per
// docs/on-this-day/ART-DIRECTION.md section 5 ("The z-space and camera"):
//  1. A CSS-only stand-in for the bible's one R3F scene: a `Camera` that
//     dollies/trucks, and `Plane`s that sit at the bible's fixed z depths.
//  2. That the resulting parallax is real - two planes at different z,
//     the same camera move, different apparent motion.
//
// Everything else (the actual archetypes, junk, type treatment) is out of
// scope. This is deliberately dumb.
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FALLBACK_STACK, FONT_FAMILY, loadFonts} from './fonts';

loadFonts();

export const HOUSE_BLUE = '#1A1AFF';

// Section 5's plane table, z in pixels at 1080x1920 design scale.
export const PLANE_Z = {
	screen: 0,
	type: -100,
	furniture: -300,
	collage: -600,
	loop: -900,
	ground: -1400,
	page: -2400,
} as const;

type CameraPosition = {
	x: number;
	y: number;
	z: number;
};

// -------------------------------------------------------------------------
// Camera: a perspective container whose vertical FOV matches the bible's
// 35 degrees at the 1080x1920 design frame. Moving the camera is implemented
// by translating the world in the opposite direction (a fixed-perspective-
// origin, translate-only camera - the bible says the camera never rolls, so
// this is the whole rig we need). Every Plane's translateZ then composes
// with this to give correct perspective-divide parallax for free.
// -------------------------------------------------------------------------
const verticalFovToPerspectivePx = (fovDegrees: number, heightPx: number) => {
	const halfFovRadians = (fovDegrees / 2) * (Math.PI / 180);
	return heightPx / 2 / Math.tan(halfFovRadians);
};

export const CAMERA_FOV_DEGREES = 35;

export const Camera: React.FC<{
	position: CameraPosition;
	children: React.ReactNode;
}> = ({position, children}) => {
	const {width, height} = useVideoConfig();
	const perspective = useMemo(
		() => verticalFovToPerspectivePx(CAMERA_FOV_DEGREES, height),
		[height],
	);

	return (
		<div
			style={{
				width,
				height,
				perspective: `${perspective}px`,
				perspectiveOrigin: '50% 50%',
				overflow: 'hidden',
				transformStyle: 'preserve-3d',
			}}
		>
			<div
				style={{
					width,
					height,
					transformStyle: 'preserve-3d',
					// World moves opposite the camera; z is inverted relative to x/y
					// because a camera dolly "forward" (into the scene, where the
					// negative-z planes live) should bring the world closer, i.e. a
					// positive world-space translateZ.
					transform: `translate3d(${-position.x}px, ${-position.y}px, ${position.z}px)`,
				}}
			>
				{children}
			</div>
		</div>
	);
};

// -------------------------------------------------------------------------
// Plane: places children at a fixed z (see PLANE_Z above), full-frame and
// centred, matching how the bible describes each plane ("one large plane",
// "textured planes... per element", etc). z depth is the only thing this
// placeholder cares about - real content is layout on top.
// -------------------------------------------------------------------------
export const Plane: React.FC<{
	z: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}> = ({z, children, style}) => {
	const {width, height} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width,
				height,
				marginLeft: -width / 2,
				marginTop: -height / 2,
				transform: `translateZ(${z}px)`,
				transformStyle: 'preserve-3d',
				...style,
			}}
		>
			{children}
		</div>
	);
};

// -------------------------------------------------------------------------
// The parallax proof: camera dollies 200px over 60 frames (frames 0-59).
// Two planes carry a same-size, same-position box - Furniture (z -300, near)
// and Ground (z -1400, far). Because both sit at a fixed x/y and only the
// camera moves in z, the near box grows/shifts noticeably more on screen
// than the far box over the same 60 frames. That differential is parallax;
// a screenshot at f0 vs f59 should show the two boxes no longer aligned.
// -------------------------------------------------------------------------
const DOLLY_FRAMES = 60;
const DOLLY_DISTANCE_PX = 200;

export const OnThisDay: React.FC<{day: string}> = ({day}) => {
	const frame = useCurrentFrame();

	const cameraZ = interpolate(frame, [0, DOLLY_FRAMES], [0, DOLLY_DISTANCE_PX], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: HOUSE_BLUE}}>
			<Camera position={{x: 0, y: 0, z: cameraZ}}>
				{/* Ground plane, z -1400: far side of the parallax proof. */}
				<Plane z={PLANE_Z.ground}>
					<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
						<div
							style={{
								width: 500,
								height: 500,
								border: '8px solid white',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: FALLBACK_STACK.mono,
								color: 'white',
								fontSize: 28,
							}}
						>
							GROUND z={PLANE_Z.ground}
						</div>
					</AbsoluteFill>
				</Plane>

				{/* Furniture plane, z -300: near side of the parallax proof. */}
				<Plane z={PLANE_Z.furniture}>
					<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
						<div
							style={{
								width: 320,
								height: 320,
								border: '8px solid #FFEE00',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontFamily: FALLBACK_STACK.mono,
								color: '#FFEE00',
								fontSize: 24,
								transform: 'translateY(260px)',
							}}
						>
							FURNITURE z={PLANE_Z.furniture}
						</div>
					</AbsoluteFill>
				</Plane>

				{/* Type plane, z -100: the placeholder subject of this dry run. */}
				<Plane z={PLANE_Z.type}>
					<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
						<div
							style={{
								fontFamily: `${FONT_FAMILY.anton}, ${FALLBACK_STACK.sans}`,
								fontSize: 260,
								color: 'white',
								textTransform: 'uppercase',
								letterSpacing: '-0.01em',
								textAlign: 'center',
								textShadow: '6px 6px 0 #000',
							}}
						>
							{day}
						</div>
						<div
							style={{
								position: 'absolute',
								bottom: 140,
								fontFamily: FONT_FAMILY.silkscreen,
								fontSize: 44,
								color: '#FFEE00',
								imageRendering: 'pixelated',
							}}
						>
							ON THIS DAY - PLACEHOLDER
						</div>
						<div
							style={{
								position: 'absolute',
								bottom: 70,
								fontFamily: `${FONT_FAMILY.anybody}, ${FALLBACK_STACK.sans}`,
								fontVariationSettings: `'wdth' 110, 'wght' 700`,
								fontSize: 40,
								color: 'white',
							}}
						>
							camera z = {cameraZ.toFixed(1)}px
						</div>
					</AbsoluteFill>
				</Plane>
			</Camera>
		</AbsoluteFill>
	);
};
