import './helpers/browser';
import test from 'ava';
import * as fc from 'fast-check';

import { SelectionType } from '../handle-selection/types';
import { areSetsEqual, arbitrarySelectionContext, prop } from './helpers';
import handleSelection from '../handle-selection';

test(
	'default export is function',
	assert => assert.is(typeof handleSelection, 'function')
);

prop(
	'execute custom strategies',
	arbitrarySelectionContext({
		data: fc.integer(),
		altKey: fc.constant(true),
		selectionType: fc.constant('keyboard' as SelectionType)
	}),
	ctx => {
		const expectedSelection = new Set([1, 8, 3]);
		const { newSelection } = handleSelection<number>(ctx as any, [
			{
				getNewSelection: context => new Set(expectedSelection),
				getStateUpdates: context => null,
				matches: {
					keyboard: ({ altKey }) => altKey
				}
			}
		]);

		return areSetsEqual(expectedSelection, newSelection);
	}
);
