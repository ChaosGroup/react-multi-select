// @flow

import {
	TSelectionStrategy,
	TStateUpdate,
	TSelectionContext,
	STRATEGY_NAME
} from './types';

/**
 * Toggles the selection status of for the passed data in the set of the selection context.
 * If the value of the 'data' field is present in the set, it is removed from the set (the item is unselected).
 * If the value wasn't present in the set, it is added to the set (the item is selected).
 */

export const name = STRATEGY_NAME.TOGGLE_SINGLE;

export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	const { selection, data } = selectionContext;

	const newSelection = new Set(selection);
	const isTargetSelected = selection.has(data);

	if (isTargetSelected) {
		newSelection.delete(data);
	} else {
		newSelection.add(data);
	}

	return newSelection;
};
export const getStateUpdates = <DT>(selectionContext: TSelectionContext<DT>): TStateUpdate => {
	const { currentActionIndex, selection, data } = selectionContext;

	return {
		lastActionIndex: currentActionIndex,
		lastAction: selection.has(data) ? 'delete' : 'add'
	};
};

export const matches = {
	mouse<DT>({ ctrlKey, shiftKey, altKey }: TSelectionContext<DT>): boolean {
		// matches only control modifier
		return ctrlKey && !shiftKey && !altKey;
	},
	keyboard<DT>({ ctrlKey, shiftKey, key }: TSelectionContext<DT>): boolean {
		return !shiftKey && ctrlKey && (key === ' ');
	}
};
