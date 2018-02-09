import test from 'ava';
import * as React from 'react';
import { TSelectableProps } from '../../Selectable';
import { SelectionAction, SelectionType, TSelectionStrategy, TSelectionContext } from '../../handle-selection/types';

const pickSelectors = (selectionContext: { [id: string]: any }) => JSON.stringify(
	[
		'ctrlKey',
		'shiftKey',
		'altKey',
		'key',
		'selectionType'
	].reduce((obj: object, key: string) => ({ ...obj, [key]: selectionContext[key] }), selectionContext)
);

export const toMockSelectables = <T>(dataItems: T[]) => dataItems.map(data => ({ props: { data } }));

export const testIsMatching = <DT>(strategy: TSelectionStrategy, shouldMatch: Iterable<TSelectionContext<DT>>, shouldNotMatch: Iterable<TSelectionContext<DT>>) => {
	for (const selectionContext of shouldMatch) {
		const { selectionType } = selectionContext;
		test(`matches for ${pickSelectors(selectionContext)}`, assert => {
			assert.true(strategy.matches[selectionType](selectionContext));
		});
	}

	for (const selectionContext of shouldNotMatch) {
		const { selectionType } = selectionContext;
		test(`doesn't match for ${pickSelectors(selectionContext)}`, assert => {
			assert.false(strategy.matches[selectionType](selectionContext));
		});
	}
}

export const minSelectionContext = Object.freeze({
	selection: new Set([1, 5, 10, 42]),
	data: 8,
	lastAction: ('add' as SelectionAction),
	lastActionIndex: 2,
	currentActionIndex: 5,
	children: toMockSelectables([1, 2, 5, 6, 10, 7, 42]) as React.ReactElement<TSelectableProps<number>>[],
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	selectionType: ('mouse' as SelectionType)
});

export const selectionCtx = <DT>(overrides: object): TSelectionContext<DT> => {
	return ({ ...minSelectionContext, ...overrides } as TSelectionContext<DT>);
};