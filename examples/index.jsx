import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Paragraphs from './stories/paragraphs/';
import NestedLists from './stories/nested-lists/';
import CustomStrategy from './stories/custom-strategies/';


storiesOf('Examples', {})
	.add('Paragraphs', () => {
		const paragraphs = [
			'steevy j',
			'pete',
			'clair',
			'billy g',
			'uncle linus'
		];
		return <Paragraphs texts={paragraphs} />;
	})
	.add('Nested Lists', () => {
		const folder = {
			name: 'docs',
			entries: [
				{ name: 'penka.js' },
				{ name: 'CMakeList.txt' },
				{
					name: 'photos',
					entries: [
						{ name: 'pic1.jpg' },
						{ name: 'pic2.png' }
					]
				},
				{
					name: 'memes',
					entries: [
						{ name: 'it`s something.jpg' },
						{ name: 'javascript-is-weird.bmp' }
					]
				},
				{
					name: 'Recycle Bin',
					entries: [
						{ name: 'system32' },
						{ name: '.net', entries: [{ name: 'C#' }, { name: 'CLR' }] },
						{ name: 'windows' },
						{ name: 'craple' }
					]
				}
			]
		};
		return <NestedLists data={folder} />;
	})
	.add('Code your own selection rules', () => {
		const listItems = Array.from({ length: 30 }, (_, i) => i);
		return <CustomStrategy numbers={listItems} />;
	});
