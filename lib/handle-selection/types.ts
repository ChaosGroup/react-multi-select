import * as React from 'react';
import Selectable, { TSelectableProps } from '../Selectable';

export type SelectionType = 'mouse' | 'keyboard';

/**
 * Users can either add items to the selection set or remove them from it.
 */
export type SelectionAction = 'add' | 'delete';

export interface TSelectionInfo {
	data: any;
	selectionType: SelectionType;
	currentActionIndex: number;
}

export type TSelectionEvent<TElement> = (React.MouseEvent<TElement> | React.KeyboardEvent<TElement>) & { key?: string; };

export interface TSelectionContext<DT> {
	/**
	 * Contains values by which selected items can be identified.
	 */
	selection: Set<DT>;
	/**
	 * Data key for the item whose selection will be modified.
	 */
	data: any;
	/**
	 * interface of last selection modification.
	 */
	lastAction: SelectionAction;
	/**
	 * On which index in the children array was the last selection modification perfmormed.
	 */
	lastActionIndex: number;
	/**
	 * The current index in the children array where a selection modification should be performed.
	 */
	currentActionIndex: number;
	/**
	 * All selectable items for the current selection modification.
	 * Provides access to their data key via children[i].props.data .
	 */
	children: React.ReactElement<TSelectableProps<DT>>[];

	selectionType: SelectionType;

	/**
	 * Define the active modifiers for the selection modification.
	 */
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	key?: string;
};

export interface TStateUpdate {
	lastAction?: SelectionAction;
	lastActionIndex?: number;
	focusedIndex?: number;
}

/**
 * Interface which selection strategies should provide.
 */
export interface TSelectionStrategy {
	/**
	 * Calculates and returns a new Set of data keys based on the selectionContext, which can be mapped to the currently selected items.
	 */
	getNewSelection<DT>(selectionContext: TSelectionContext<DT>): Set<DT>;
	/**
	 * Calculate state updates based on the passed selectionContext.
	 */
	getStateUpdates<DT>(selectionContext: TSelectionContext<DT>): TStateUpdate;

	matches: {
		[id in SelectionType]?: <DT>(selectionContext: TSelectionContext<DT>) => boolean;
	};
}

export interface TSelectionResult<DT> {
	stateUpdates: TStateUpdate;
	newSelection: Set<DT>
}
