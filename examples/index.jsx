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
					name: 'naked-photos',
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
						{ name: 'crapple' }
					]
				}
			]
		};
		return <NestedLists data={folder} />;
	});
