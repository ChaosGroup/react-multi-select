import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Paragraphs from './stories/paragraphs/';
import NestedLists from './stories/nested-lists/';


storiesOf('Examples', {})
	.add('Paragraphs', () => {
		const paragraphs = [
			'gosho',
			'pesho',
			'shosho',
			'tosho',
		];
		return <Paragraphs texts={paragraphs} />;
	})
	.add('Nested Lists', () => {
		const data = [
			['uno', 'dos', 'tres', ['gadno a', 'test']],
			['languages', ['html', 'javascript', 'css'], ['build tools', ['webpack', 'fuse-box']]],
			['bork', 'mew', 'hurrdurr', 'yawn']
		];
		return <NestedLists data={data} />;
	});
