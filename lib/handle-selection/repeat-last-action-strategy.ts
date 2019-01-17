import { ensureRange } from '../utils';
import { TStateUpdate, TSelectionContext, STRATEGY_NAME } from './types';

/**
 * Repeats the last action (addition or deletion) from the last modified selection to the
 * current selection, inclusive.
 */

export const name = STRATEGY_NAME.REPEAT_RANGE;

export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	const {
		selection,
		lastAction,
		lastActionIndex,
		currentActionIndex,
		childrenData
	} = selectionContext;

	const newSelected = new Set(selection);

	const minIndex = 0;
	const maxIndex = childrenData.length - 1;
	/* get starting index, but ensure at least 0 */
	const actionStartIndex = ensureRange(minIndex, Math.min(currentActionIndex, lastActionIndex), maxIndex);
	/* get end index, but ensure at most the last index of children */
	const actionEndIndex = ensureRange(minIndex, Math.max(currentActionIndex, lastActionIndex), maxIndex);

	const action = lastAction === 'delete' ?
		(data: DT) => newSelected.delete(data) :
		(data: DT) => newSelected.add(data);

	for (let i = actionStartIndex; i <= actionEndIndex; ++i) {
		action(childrenData[i]);
	}

	return newSelected;
};

export const getStateUpdates = <DT>(selectionContext: TSelectionContext<DT>): TStateUpdate => {
	const { currentActionIndex } = selectionContext;

	return { lastActionIndex: currentActionIndex };
};

export const matches = {
	mouse<DT>({ shiftKey }: TSelectionContext<DT>): boolean {
		return shiftKey;
	},
	keyboard<DT>({ shiftKey, key }: TSelectionContext<DT>): boolean {
		return shiftKey && (key === ' ');
	}
};
