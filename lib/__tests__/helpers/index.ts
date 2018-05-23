import test from 'ava';
import * as enzyme from 'enzyme';
import * as React from 'react';
import { TSelectableProps } from '../../Selectable';
import {
	SelectionAction,
	SelectionType,
	TSelectionStrategy,
	TSelectionContext
} from '../../handle-selection/types';

const pickSelectors = (selectionContext: { [id: string]: any }) => JSON.stringify(
	[
		'ctrlKey',
		'shiftKey',
		'altKey',
		'key',
		'selectionType'
	].reduce((obj: object, key: string) => ({ ...obj, [key]: selectionContext[key] }), selectionContext)
);

export const testIsMatching = <DT>(
	strategy: TSelectionStrategy,
	shouldMatch: Iterable<TSelectionContext<DT>>,
	shouldNotMatch: Iterable<TSelectionContext<DT>>,
	name: string
) => {
	for (const selectionContext of shouldMatch) {
		const { selectionType } = selectionContext;
		test(`${name} matches for ${pickSelectors(selectionContext)}`, assert => {
			assert.true(strategy.matches[selectionType](selectionContext));
		});
	}

	for (const selectionContext of shouldNotMatch) {
		const { selectionType } = selectionContext;
		test(`${name} doesn't match for ${pickSelectors(selectionContext)}`, assert => {
			assert.false(strategy.matches[selectionType](selectionContext));
		});
	}
};

export const minSelectionContext = Object.freeze({
	selection: new Set([1, 5, 10, 42]),
	data: 8,
	lastAction: ('add' as SelectionAction),
	lastActionIndex: 2,
	currentActionIndex: 5,
	childrenData: [1, 2, 5, 6, 10, 7, 42],
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	selectionType: ('mouse' as SelectionType)
});

export const selectionCtx = <DT>(overrides: object): TSelectionContext<DT> => {
	return ({ ...minSelectionContext, ...overrides } as any /* GJ typescript */ as TSelectionContext<DT>);
};

export const noop = () => undefined;

export const simulateFocus = (
	wrapper: enzyme.ReactWrapper<any, any>,
	selectableWrapper: enzyme.ReactWrapper<any, any>
) => {
	(selectableWrapper.getDOMNode() as HTMLElement).focus();
	wrapper.simulate('click');
};
