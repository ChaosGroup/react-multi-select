import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Paragraphs from './stories/paragraphs/';


storiesOf('Selectable paragraphs', {})
	.add('Paragraphs', () => <Paragraphs />);
