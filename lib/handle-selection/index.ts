import {
	TSelectionContext,
	TSelectionStrategy,
	TSelectionResult,
	STRATEGY_NAME
} from './types';

import * as repeatAction from './repeat-last-action-strategy';
import * as selectSingle from './select-new-entry-strategy';
import * as toggleSingle from './toggle-item-selection-strategy';
import * as selectAll from './select-all-strategy';

export * from './types';

export const strategies = { repeatAction, selectAll, toggleSingle, selectSingle };

const getStrategy = <DT>(stratOrName: TSelectionStrategy<DT> | STRATEGY_NAME): TSelectionStrategy<DT> => {
	return (stratOrName as number in STRATEGY_NAME)
		? Object.values(strategies).find(s => s.name === stratOrName)
		: stratOrName as TSelectionStrategy<DT>;
};

export default <DT>(
	selectionContext: TSelectionContext<DT>,
	availableStrategies: Array<TSelectionStrategy<DT> | STRATEGY_NAME>
): TSelectionResult<DT> => {
	const { selectionType } = selectionContext;
	const matchingStrategy = availableStrategies
		.map(getStrategy)
		.find(strat => {
			const isMatchFn = strat.matches[selectionType];
			return isMatchFn && isMatchFn(selectionContext);
		});

	if (!matchingStrategy) {
		return {
			newSelection: null,
			stateUpdates: null
		};
	}

	const newSelection = matchingStrategy.getNewSelection(selectionContext);
	const stateUpdates = matchingStrategy.getStateUpdates(selectionContext);

	return { newSelection, stateUpdates };
};
