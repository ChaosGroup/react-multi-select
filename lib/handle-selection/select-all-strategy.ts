import { TSelectionStrategy, TStateUpdate, TSelectionContext } from './types';

export const getNewSelection = <DT>(selectionContext: TSelectionContext<DT>): Set<DT> => {
	const { selection, children } = selectionContext;
	const childrenDataKeys = children.map(child => child.props.data);
	return new Set([...selection, ...childrenDataKeys]);
};

export const getStateUpdates = <DT>(): TStateUpdate => {
	return null;
};

export const matches = {
	keyboard<DT>({ ctrlKey, key }: TSelectionContext<DT>): boolean {
		return ctrlKey && (key === 'a');
	}
}
