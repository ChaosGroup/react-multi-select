import * as React from 'react';

export enum STRATEGY_NAME {
	REPEAT_RANGE = 0,
	SELECT_ALL = 1,
	SELECT_SINGLE = 2,
	TOGGLE_SINGLE = 3
}

export type TFocusable = { focus: () => void };

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

export type TSelectionEvent<TElement> =
	(React.MouseEvent<TElement> | React.KeyboardEvent<TElement>) & { key?: string; target: TElement; };

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
	childrenData: DT[];

	selectionType: SelectionType;

	lastData?: DT;

	/**
	 * Define the active modifiers for the selection modification.
	 */
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
	key?: string;
}

export interface TStateUpdate {
	lastAction?: SelectionAction;
	lastActionIndex?: number;
	[key: string]: any;
}

/**
 * Interface which selection strategies should provide.
 */
export interface TSelectionStrategy<DT> {
	name?: STRATEGY_NAME;
	matches: {
		[id in SelectionType]?: (selectionContext: TSelectionContext<DT>) => boolean;
	};
	/**
	 * Calculates and returns a new Set of data keys based on the selectionContext,
	 * which can be mapped to the currently selected items.
	 */
	getNewSelection(selectionContext: TSelectionContext<DT>): Set<DT>;
	/**
	 * Calculate state updates based on the passed selectionContext.
	 */
	getStateUpdates(selectionContext: TSelectionContext<DT>): TStateUpdate;
}

export interface TSelectionResult<DT> {
	stateUpdates: TStateUpdate;
	newSelection: Set<DT>;
}
