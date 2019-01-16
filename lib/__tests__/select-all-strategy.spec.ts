import './helpers/browser';
import test from 'ava';
import * as fc from 'fast-check';

import { minSelectionContext, selectionCtx } from './helpers/index';
import { SelectionAction, SelectionType } from '../handle-selection/types';
import * as selectAll from '../handle-selection/select-all-strategy';

{
	test('matches ctrl+a and nothing else', assert => {
		const arbitrarySelectionContext = fc.array(fc.integer(), 1, 1000)
			.chain(childrenData => fc.tuple(fc.constant(childrenData), fc.shuffledSubarray(childrenData)))
			.chain(([data, selection]) => fc.record({
				selection: fc.constant(new Set(selection)),
				data: fc.constantFrom(...data),
				lastAction: fc.constantFrom('add' as SelectionAction, 'remove' as SelectionAction),
				lastActionIndex: fc.integer(0, data.length),
				currentActionIndex: fc.integer(0, data.length),
				childrenData: fc.constant(data),
				selectionType: fc.constant('keyboard' as SelectionType),
				altKey: fc.boolean(),
				ctrlKey: fc.boolean(),
				shiftKey: fc.boolean(),
				key: fc.constantFrom(
					...Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97))
				)
			}));

		fc.assert(
			fc.property(
				arbitrarySelectionContext,
				ctx => selectAll.matches.keyboard(ctx) === (ctx.ctrlKey && ctx.key === 'a')
			)
		);
		assert.pass();
	});
}

test(`doesn't have "mouse" property`, assert => {
	assert.false('mouse' in selectAll.matches);
});

test('returns a Set containing the same data when selected children is an empty array', assert => {
	const selectionContext = selectionCtx<number>({ childrenData: [] });

	const expectedSelection = selectionContext.selection;
	const newSelection = selectAll.getNewSelection(selectionContext);

	assert.is(newSelection.size, expectedSelection.size);
	assert.deepEqual([...newSelection], [...expectedSelection]);
});

test('returns a new Set containing the data from the set and the data from the children', assert => {
	const initiallySelected = [1, 5, 'beep boop'];
	const childrenData = [7, 5, 'beep'];
	const selectionContext = selectionCtx({
		...minSelectionContext,
		selection: new Set(initiallySelected),
		childrenData
	});

	const expectedSelection = new Set([...initiallySelected, ...childrenData]);
	const newSelection = selectAll.getNewSelection(selectionContext);
	assert.deepEqual([...newSelection], [...expectedSelection]);
});

test('returns empty Set for empty children array and empty prior selection', assert => {
	const selectionContext = selectionCtx<number>({ selection: new Set, childrenData: [] });

	const newSelection = selectAll.getNewSelection(selectionContext);

	assert.is(newSelection.size, 0);
});

test('returns null', assert => {
	assert.is(selectAll.getStateUpdates(minSelectionContext), null);
});
