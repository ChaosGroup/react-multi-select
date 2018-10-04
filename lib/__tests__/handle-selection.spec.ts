import './helpers/browser';
import test from 'ava';
import { selectionCtx, areSetsEqual } from './helpers';
import handleSelection from '../handle-selection';

test('default export is function', assert => assert.is(typeof handleSelection, 'function'));

test('execute custom strategies', assert => {
	const expectedSelection = new Set([Symbol('abc'), Symbol('kek')]);
	const bogusCtx = selectionCtx({ altKey: true, selectionType: 'keyboard' });
	const { newSelection, stateUpdates } = handleSelection(bogusCtx, [
		{
			getNewSelection: ctx => new Set(expectedSelection),
			getStateUpdates: ctx => null,
			matches: {
				keyboard: ({ altKey }) => altKey
			}
		}
	]);

	assert.true(areSetsEqual(newSelection, expectedSelection));
	assert.true(stateUpdates == null);
});
