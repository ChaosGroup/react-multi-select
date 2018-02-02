import test from 'ava';
import { testIsMatching, minSelectionContext, toMockSelectables, selectionCtx } from './helpers/index';
import * as toggleSelectedItem from '../handle-selection/toggle-item-selection-strategy';

{
	const selectionType = 'mouse';

	const shouldMatch = [
		selectionCtx({ selectionType, ctrlKey: true, shiftKey: false })
	];
	const shouldNotMatch = [
		selectionCtx({ selectionType, ctrlKey: true, shiftKey: true }),
		selectionCtx({ selectionType, ctrlKey: false, shiftKey: true }),
		selectionCtx({ selectionType, ctrlKey: false, shiftKey: false })
	];

	testIsMatching(toggleSelectedItem, shouldMatch, shouldNotMatch);
}

{
	const selectionType = 'keyboard';
	const key = ' ';

	const shouldMatch = [
		selectionCtx({ selectionType, key, ctrlKey: true, shiftKey: false })
	];
	const shouldNotMatch = [
		selectionCtx({ selectionType, key, ctrlKey: true, shiftKey: true }),
		selectionCtx({ selectionType, key, ctrlKey: false, shiftKey: true }),
		selectionCtx({ selectionType, key, ctrlKey: false, shiftKey: false })
	];

	testIsMatching(toggleSelectedItem, shouldMatch, shouldNotMatch);
}

test(`adds the passed data to the resulting Set if it wasn't present in the input Set`, assert => {
	const initialSelection = [1, 5, 8, -5];
	const data = 42;
	const selectionContext = selectionCtx({
		selection: new Set(initialSelection),
		data
	});

	const newSelection = toggleSelectedItem.getNewSelection(selectionContext);
	assert.is(newSelection.size, initialSelection.length + 1);
	assert.deepEqual([...newSelection].sort(), [data, ...initialSelection].sort());
});

test('removes the passed data from the Set if it was present in the input Set', assert => {
	const initialSelection = [1, 5, 8, -5];
	const data = initialSelection[0];
	const selectionContext = selectionCtx({
		selection: new Set(initialSelection),
		data
	});

	const newSelection = toggleSelectedItem.getNewSelection(selectionContext);
	assert.is(newSelection.size, initialSelection.length - 1);
	assert.deepEqual([...newSelection], initialSelection.slice(1));
});

test('sets the lastActionIndex to the currentActionIndex from input context', assert => {
	const currentActionIndex = 5;
	const children = toMockSelectables(Array.from({ length: currentActionIndex * 2 }).map((_, i) => i));
	const selectionContext = selectionCtx({
		children,
		currentActionIndex
	});

	const { lastActionIndex } = toggleSelectedItem.getStateUpdates(selectionContext);
	assert.is(lastActionIndex, currentActionIndex);
});

test(`sets the lastAction to 'add' when the data was't present in the input Set`, assert => {
	const data = 5;
	const selection = new Set([1, 3, 8]);
	const selectionContext = selectionCtx({
		selection,
		data
	});

	const { lastAction } = toggleSelectedItem.getStateUpdates(selectionContext);
	assert.is(lastAction, 'add');
});

test(`sets the lastAction to 'delete' when the data was present in the input Set`, assert => {
	const data = 5;
	const selection = new Set([1, 3, 5, 8]);
	const selectionContext = selectionCtx({
		selection,
		data
	});

	const { lastAction } = toggleSelectedItem.getStateUpdates(selectionContext);
	assert.is(lastAction, 'delete');
});
