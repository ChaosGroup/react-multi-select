import { TSelectionStrategy, TStateUpdate, TSelectionContext } from './types';

export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	const { selection, childrenData } = selectionContext;
	return new Set([...selection, ...childrenData]);
};

export const getStateUpdates = <DT>(electionContext: TSelectionContext<DT>): TStateUpdate => {
	return null;
};

export const matches = {
	keyboard<DT>({ ctrlKey, key }: TSelectionContext<DT>): boolean {
		return ctrlKey && (key === 'a');
	}
};
