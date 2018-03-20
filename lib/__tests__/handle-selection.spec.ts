import './helpers/browser';
import test from 'ava';
import handleSelection from '../handle-selection/index';
import { selectionCtx } from './helpers';
import { spy } from 'sinon';
import {
	TSelectionStrategy,
	TStateUpdate,
	TSelectionContext
} from '../handle-selection/types';

test('default export is function', assert => {
	assert.is(typeof handleSelection, 'function');
});

test('if no matching strategy, return null for newSelection and null for stateUpdates', assert => {
	const noMatch = selectionCtx({
		altKey: true,
		selectionType: 'keyboard'
	});

	const { newSelection, stateUpdates } = handleSelection(noMatch);
	assert.true(newSelection == null);
	assert.true(stateUpdates == null);
});

test('if no matching strategy, use default strategy, if provided', assert => {
	const noMatch = selectionCtx({
		altKey: true,
		selectionType: 'keyboard'
	});

	const getNewSelection = spy();
	const getStateUpdates = spy();
	const defaultStrat: TSelectionStrategy = {
		getNewSelection: getNewSelection as (selectionContext: TSelectionContext<any>) => Set<any>,
		getStateUpdates: getStateUpdates as (selectionContext: TSelectionContext<any>) => TStateUpdate,
		matches: {}
	};

	const { newSelection, stateUpdates } = handleSelection(noMatch, defaultStrat);
	assert.true(getNewSelection.calledOnce);
	assert.true(getStateUpdates.calledOnce);
});
