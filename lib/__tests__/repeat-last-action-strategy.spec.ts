import test from 'ava';
import { SelectionAction, TSelectionContext } from '../handle-selection/types';
import { testIsMatching, minSelectionContext, toMockSelectables, selectionCtx } from './helpers/index';
import * as repeatLastSelectionAction from '../handle-selection/repeat-last-action-strategy';

{
	const selectionType = 'mouse';

	const shouldMatch = [
		selectionCtx({ selectionType, shiftKey: true })
	];
	const shouldNotMatch = [
		selectionCtx({ selectionType, ctrlKey: true, shiftKey: false }),
		selectionCtx({ selectionType, ctrlKey: false, shiftKey: false })
	];

	testIsMatching(repeatLastSelectionAction, shouldMatch, shouldNotMatch);
}

{
	const selectionType = 'keyboard';
	const key = ' ';

	const shouldMatch = [
		selectionCtx({ selectionType, key, shiftKey: true })
	];

	const shouldNotMatch = [
		selectionCtx({ selectionType, key, ctrlKey: true, shiftKey: false }),
		selectionCtx({ selectionType, key, ctrlKey: false, shiftKey: false })
	];

	testIsMatching(repeatLastSelectionAction, shouldMatch, shouldNotMatch);
}

test(`returns set containing old data + every data from the range [start, end] when last action was 'add'`, test => {
	const start = 1;
	const end = 5;
	const notInitiallySelected = [
		[6, {}, 'sdfsdfds'],
		[-42, { ilove: 'shipping console.log`s in production code' }, [1, 2, 3]]
	];
	const expectedSelection = [
		'roses are red',
		'violets are blue',
		...notInitiallySelected[0],
		'this test was hard to write',
		'so it should be hard to read too'
	];
	const initialSelection = [
		...expectedSelection.slice(0, 2),
		...expectedSelection.slice(-2)
	];
	const allChildrenData = [
		...expectedSelection,
		...notInitiallySelected[1]
	];

	const selectionContext = selectionCtx<any>({
		lastActionIndex: start,
		currentActionIndex: end,
		data: allChildrenData[end],
		lastAction: ('add' as SelectionAction),
		selection: new Set(initialSelection),
		children: toMockSelectables(allChildrenData)
	});
	const newSelection = repeatLastSelectionAction.getNewSelection(selectionContext);

	test.is(newSelection.size, expectedSelection.length);
	test.deepEqual([...newSelection].sort(), expectedSelection.sort());
});

test(`returns set containing old data minus every data from the range [start, end] when last action was 'delete'`, assert => {
	const start = 3;
	const end = 9;
	const expectedSelection = [
		'roses are red',
		'violets are blue',
		'i listen to gery-nikol',
		'and so should you',
		'// such poesy, much skill, such wow'
	];

	const initialSelection = [
		...expectedSelection.slice(0, start),
		...Array.from({ length: end - start }).map((_, i) => String(i)),
		...expectedSelection.slice(start)
	];

	const allChildrenData = [
		...initialSelection.slice(0, 2 * start - end + 1),
		'gosho',
		'pesho',
		'ivan',
		...initialSelection.slice(2 * start - end + 1)
	];

	const selectionContext = selectionCtx({
		...minSelectionContext,
		lastActionIndex: start,
		currentActionIndex: end,
		data: allChildrenData[end],
		lastAction: ('delete' as SelectionAction),
		selection: new Set(initialSelection),
		children: toMockSelectables(allChildrenData)
	});

	const newSelection = repeatLastSelectionAction.getNewSelection(selectionContext);
	assert.is(newSelection.size, expectedSelection.length);
	assert.deepEqual([...newSelection], expectedSelection);
});

test('behaves as called with currentActionIndex: 0 when currentActionIndex is negative', assert => { });
test('behaves as called with children.length - 1 when currentActionIndex is greater then children.length', assert => { });
test('behaves as called with lastActionIndex: 0 when lastActionIndex is negative', assert => { });
test('behaves as called with children.length - 1 when lastActionIndex is greater then children.length', assert => { });

{
	const selectionContext = selectionCtx({
		...minSelectionContext,
		lastActionIndex: 0,
		currentActionIndex: 4,
		children: toMockSelectables([1, 2, 3, 4, 5, 6, 7, 8])
	});

	const { currentActionIndex } = selectionContext;
	test('sets lastActionIndex to currentActionIndex from passed context', assert => {
		const { lastActionIndex } = repeatLastSelectionAction.getStateUpdates(selectionContext);
		assert.is(lastActionIndex, currentActionIndex);
	});

	test(`doesn't return update for lastAction property when lastAction in selection context is 'delete'`, assert => {
		const { lastAction } = repeatLastSelectionAction.getStateUpdates({ ...selectionContext, lastAction: 'delete' });
		assert.is(lastAction, undefined);
	});

	test(`doesn't return update lastAction property when lastAction in selection context is 'add'`, assert => {
		const { lastAction } = repeatLastSelectionAction.getStateUpdates({ ...selectionContext, lastAction: 'add' });
		assert.is(lastAction, undefined);
	});
}