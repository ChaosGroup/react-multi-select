import test from 'ava';
import { testIsMatching, minSelectionContext, selectionCtx } from './helpers/index';
import * as selectNewEntry from '../handle-selection/select-new-entry-strategy';

{
	const shouldMatch = [
		selectionCtx({ selectionType: 'mouse', ctrlKey: false, shiftKey: false })
	];
	const shouldNotMatch = [
		selectionCtx({ selectionType: 'mouse', ctrlKey: false, shiftKey: true }),
		selectionCtx({ selectionType: 'mouse', ctrlKey: true, shiftKey: false }),
		selectionCtx({ selectionType: 'mouse', ctrlKey: true, shiftKey: true })
	];

	testIsMatching(selectNewEntry, shouldMatch, shouldNotMatch);
}

{

	const shouldMatch = [
		selectionCtx({ selectionType: 'keyboard', ctrlKey: false, shiftKey: false, key: ' ' })
	];
	const shouldNotMatch = [
		selectionCtx({ selectionType: 'keyboard', ctrlKey: false, shiftKey: true }),
		selectionCtx({ selectionType: 'keyboard', ctrlKey: true, shiftKey: false }),
		selectionCtx({ selectionType: 'keyboard', ctrlKey: true, shiftKey: true })
	];

	testIsMatching(selectNewEntry, shouldMatch, shouldNotMatch);
}

test('returns a new Set containing only the data that has been passed in', assert => {
	const newSelectionData = 42;

	const selectionContext = selectionCtx({
		data: newSelectionData,
		selection: new Set([1, 2, 3, 50, 60])
	});

	const newSelection = selectNewEntry.getNewSelection(selectionContext);

	assert.is(newSelection.size, 1);
	assert.true(newSelection.has(newSelectionData));
});

test('returns a new Set with only the data element when current selection is empty', assert => {
	const newSelectionData = 33;

	const selectionContext = selectionCtx({
		...minSelectionContext,
		data: newSelectionData,
		selection: new Set
	});

	const newSelection = selectNewEntry.getNewSelection(selectionContext);

	assert.is(newSelection.size, 1);
	assert.true(newSelection.has(newSelectionData));
});

{

	const selectionContext = selectionCtx({ currentActionIndex: 3 });

	test(`sets lastActionIndex to currentActionIndex from passed context`, assert => {
		const { lastActionIndex } = selectNewEntry.getStateUpdates(selectionContext);

		assert.is(lastActionIndex, selectionContext.currentActionIndex);
	});

	test(`sets lastAction to 'add'`, assert => {
		const { lastAction } = selectNewEntry.getStateUpdates(selectionContext);

		assert.is(lastAction, 'add');
	});
}
