import test from 'ava';
import repeatLastSelectionAction from '../handle-selection/';

test('default export is function', assert => {
	assert.is(typeof repeatLastSelectionAction, 'function');
});
