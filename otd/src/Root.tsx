import React from 'react';
import {Composition, Still} from 'remotion';
import {OnThisDay} from './OnThisDay';
import {Cover} from './Cover';

const defaultProps = {day: '09-12'};

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="OnThisDay"
				component={OnThisDay}
				durationInFrames={720}
				fps={60}
				width={1080}
				height={1920}
				defaultProps={defaultProps}
			/>
			<Still id="Cover" component={Cover} width={1080} height={1920} defaultProps={defaultProps} />
		</>
	);
};
