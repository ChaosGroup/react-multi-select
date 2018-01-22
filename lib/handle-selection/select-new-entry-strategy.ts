import { TSelectionStrategy, TStateUpdate, TSelectionContext } from './types';

/**
 * Clear all previous selections and return a set with only one selection - the value of the 'data' field.
 */

export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	return new Set([selectionContext.data]);
};

export const getStateUpdates = <DT>(selectionContext: TSelectionContext<DT>): TStateUpdate => {
	const { currentActionIndex } = selectionContext;

	return {
		lastAction: 'add',
		lastActionIndex: currentActionIndex,
		focusedIndex: currentActionIndex
	};
};

export const matches = {
	mouse<DT>({ ctrlKey, shiftKey }: TSelectionContext<DT>): boolean {
		return !ctrlKey && !shiftKey;
	},
	keyboard<DT>({ ctrlKey, shiftKey, key }: TSelectionContext<DT>): boolean {
		return !ctrlKey && !shiftKey && (key === ' ');
	}
}
