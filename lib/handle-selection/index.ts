import {
	TSelectionContext,
	TSelectionStrategy,
	TSelectionResult
} from './types';

import * as repeatLastActionFromTo from './repeat-last-action-strategy';
import * as selectNewEntry from './select-new-entry-strategy';
import * as toggleItemSelection from './toggle-item-selection-strategy';
import * as selectAll from './select-all-strategy';

const strategies: TSelectionStrategy[] = [
	repeatLastActionFromTo,
	selectNewEntry,
	toggleItemSelection,
	selectAll
];

export default function handleSelection<DT>(
	selectionContext: TSelectionContext<DT>,
	defaultStrategy?: TSelectionStrategy
): TSelectionResult<DT> {
	const { selectionType } = selectionContext;
	const matchingStrategy = strategies.find(strat => {
		const isMatchFn = strat.matches[selectionType];
		return isMatchFn && isMatchFn(selectionContext);
	}) || defaultStrategy;

	if (!matchingStrategy) {
		return {
			newSelection: selectionContext.selection,
			stateUpdates: null
		};
	}

	const newSelection = matchingStrategy.getNewSelection(selectionContext);
	const stateUpdates = matchingStrategy.getStateUpdates(selectionContext);

	return { newSelection, stateUpdates };
}
