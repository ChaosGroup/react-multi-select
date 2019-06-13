import { TStateUpdate, TSelectionContext, STRATEGY_NAME } from './types';

/**
 * Repeats the last action (addition or deletion) from the last modified selection to the
 * current selection, inclusive.
 */

export const name = STRATEGY_NAME.REPEAT_RANGE;

export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	const {
		selection,
		childrenData,
		data,
		lastData
	} = selectionContext;

	const [start, end] = [lastData, data]
		.map(childData => childrenData.indexOf(childData))
		.sort((a, b) => a - b)
		.map(index => Math.max(0, index));

	const newSelected = new Set(selection);

	const action = selection.has(data) ?
		newSelected.delete.bind(newSelected) :
		newSelected.add.bind(newSelected);

	for (let i = start; i <= end; ++i) {
		action(childrenData[i]);
	}

	return newSelected;
};

export const getStateUpdates =
	<DT>(selectionContext: TSelectionContext<DT>): TStateUpdate => ({
		lastData: selectionContext.data
	});

export const matches = {
	mouse<DT>({ shiftKey }: TSelectionContext<DT>): boolean {
		return shiftKey;
	},
	keyboard<DT>({ shiftKey, key }: TSelectionContext<DT>): boolean {
		return shiftKey && (key === ' ');
	}
};
