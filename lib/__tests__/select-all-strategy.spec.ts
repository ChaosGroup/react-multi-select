import test from 'ava';
import { testIsMatching, minSelectionContext, toMockSelectables, selectionCtx } from '../helpers';
import * as selectAll from '../handle-selection/select-all-strategy';

{
	const shouldMatch = [
		selectionCtx({
			...minSelectionContext,
			selectionType: 'keyboard',
			ctrlKey: true,
			key: 'a'
		})
	];

	const shouldNotMatch = [
		selectionCtx({
			...minSelectionContext,
			selectionType: 'keyboard',
			ctrlKey: true,
			key: 'b'
		}),
		selectionCtx({
			...minSelectionContext,
			selectionType: 'keyboard',
			ctrlKey: false,
			key: 'a'
		})
	];

	testIsMatching(selectAll, shouldMatch, shouldNotMatch);
}

test(`doesn't have "mouse" property`, assert => {
	assert.false('mouse' in selectAll.matches);
});

test('returns a Set containing the same data when selected children is an empty array', assert => {
	const selectionContext = selectionCtx<number>({ children: [] });

	const expectedSelection = selectionContext.selection;
	const newSelection = selectAll.getNewSelection(selectionContext);

	assert.is(newSelection.size, expectedSelection.size);
	assert.deepEqual([...newSelection], [...expectedSelection]);
});

test('returns a new Set containing the data from the set and the data from the children', assert => {
	const initiallySelected = [1, 5, 'beep boop'];
	const childrenData = toMockSelectables([7, 5, 'beep']);
	const selectionContext = selectionCtx({
		...minSelectionContext,
		selection: new Set(initiallySelected),
		children: childrenData.map(data => ({ props: { data } }))
	});

	const expectedSelection = new Set([...initiallySelected, ...childrenData]);
	const newSelection = selectAll.getNewSelection(selectionContext);
	assert.deepEqual([...newSelection], [...expectedSelection]);
});

test('returns empty Set for empty children array and empty prior selection', assert => {
	const selectionContext = selectionCtx<number>({ selection: new Set, children: [] });

	const newSelection = selectAll.getNewSelection(selectionContext);

	assert.is(newSelection.size, 0);
});

test('returns null', assert => {
	assert.is(selectAll.getStateUpdates(minSelectionContext), null);
});
