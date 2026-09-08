// The CSS-3D scene rig — Camera and Plane — factored out of the original
// OnThisDay.tsx placeholder unchanged (same math, same behaviour) so every
// archetype shares one camera/plane implementation. See
// docs/on-this-day/ART-DIRECTION.md §5 "The z-space and camera".
import React, {useMemo} from 'react';
import {useVideoConfig} from 'remotion';

// §5's plane table, z in pixels at 1080x1920 design scale.
export const PLANE_Z = {
	screen: 0,
	type: -100,
	furniture: -300,
	collage: -600,
	loop: -900,
	ground: -1400,
	page: -2400,
} as const;

// The camera at rest per §5: z = 1500 looking at the origin, framing the
// type plane at exactly 1080 wide.
export const CAMERA_REST_Z = 1500;

type CameraPosition = {
	x: number;
	y: number;
	z: number;
};

const verticalFovToPerspectivePx = (fovDegrees: number, heightPx: number) => {
	const halfFovRadians = (fovDegrees / 2) * (Math.PI / 180);
	return heightPx / 2 / Math.tan(halfFovRadians);
};

export const CAMERA_FOV_DEGREES = 35;

// Camera: a perspective container whose vertical FOV matches the bible's 35
// degrees at the 1080x1920 design frame. Moving the camera is implemented by
// translating the world in the opposite direction — the bible says the
// camera never rolls, so this is the whole rig needed. Every Plane's
// translateZ composes with this for correct perspective-divide parallax.
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
					transform: `translate3d(${-position.x}px, ${-position.y}px, ${position.z}px)`,
				}}
			>
				{children}
			</div>
		</div>
	);
};

// Plane: places children at a fixed z (see PLANE_Z above), full-frame and
// centred.
export const Plane: React.FC<{
	z: number;
	children?: React.ReactNode;
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
