import test from 'ava';
import repeatLastSelectionAction from '../handle-selection/index';

test('default export is function', assert => {
	assert.is(typeof repeatLastSelectionAction, 'function');
});
