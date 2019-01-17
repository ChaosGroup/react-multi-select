import './helpers/browser';
import test from 'ava';
import * as fc from 'fast-check';

import * as selectAll from '../handle-selection/select-all-strategy';
import { arbitrarySelectionContext, prop, areSetsEqual } from './helpers';

prop(
	'matches ctrl+a and nothing else',
	arbitrarySelectionContext({ data: fc.integer() }),
	ctx => selectAll.matches.keyboard(ctx) === (ctx.ctrlKey && ctx.key === 'a')
);

test(
	`doesn't have "mouse" property`,
	assert => assert.false('mouse' in selectAll.matches)
);

prop(
	'getNewSelection returns all elements of childrenData in a Set',
	arbitrarySelectionContext({ data: fc.string() }),
	ctx => {
		const newSelection = selectAll.getNewSelection(ctx);
		const expectedSelection = new Set(ctx.childrenData);
		return areSetsEqual(expectedSelection, newSelection);
	}
);

prop(
	'getStateUpdates always returns null updates',
	arbitrarySelectionContext({ data: fc.integer() }),
	ctx => selectAll.getStateUpdates(ctx) === null
);
