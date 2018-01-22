import { TSelectionStrategy, TStateUpdate, TSelectionContext } from './types';

const ensureRange = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
/**
 * Repeats the last action (addition or deletion) from the last modified selection to the
 * current selection, inclusive.
 */
export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	const {
			selection,
		lastAction,
		lastActionIndex,
		currentActionIndex,
		children
		} = selectionContext;

	const newSelected = new Set(selection);

	const minIndex = 0;
	const maxIndex = children.length - 1;
	/* get starting index, but ensure at least 0 */
	const actionStartIndex = ensureRange(minIndex, Math.min(currentActionIndex, lastActionIndex), maxIndex);
	/* get end index, but ensure at most the last index of children */
	const actionEndIndex = ensureRange(minIndex, Math.max(currentActionIndex, lastActionIndex), maxIndex);

	const action = lastAction === 'delete' ?
		data => newSelected.delete(data) :
		data => newSelected.add(data);

	children
		.slice(actionStartIndex, actionEndIndex + 1)
		.forEach(selectable => action(selectable.props.data));

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
}
