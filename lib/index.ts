import * as React from 'react';
import { ensureRange } from './utils';

import handleSelection from './handle-selection/index';
import { TSelectableProps } from './Selectable';

import {
	TSelectionContext,
	SelectionAction,
	TSelectionInfo,
	TSelectionEvent,
	TFocusable
} from './handle-selection/types';
import { ReactElement } from 'react';

export interface TMultiSelectState {
	lastAction: SelectionAction;
	lastActionIndex: number;
	focusedIndex?: number;
}

export interface TMultiSelectProps<DT> {
	render?: keyof HTMLElementTagNameMap;
	className?: string;
	selection: Set<DT>;
	children?: React.ReactNode;
	onSelectionChange: (selected: Set<DT>) => any;
};

export default class MultiSelect<DT> extends React.PureComponent<TMultiSelectProps<DT>, Partial<TMultiSelectState>> {
	private _focusedIndex: number;
	private _focusables: TFocusable[];

	constructor(props: TMultiSelectProps<DT>) {
		super(props);

		this.state = {
			lastActionIndex: 0,
			lastAction: 'add'
		};
		this._focusables = [];
		this._focusedIndex = 0;
	}

	static defaultProps: Partial<TMultiSelectProps<any>> = {
		children: [],
		render: 'ul'
	}

	get _className() {
		return 'multiselect ' + this.props.className;
	}

	_onSelectionChange = (event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo): void => {
		const { ctrlKey, shiftKey, altKey, key = '' } = event;
		const { selection, onSelectionChange } = this.props;
		const { lastAction, lastActionIndex } = this.state;
		const childrenData = [].map.call(this.props.children, (child: React.ReactElement<TSelectableProps<DT>>) => child.props.data);
		const selectionContext: TSelectionContext<DT> = {
			...selectionInfo,
			selection,
			lastAction,
			lastActionIndex,
			childrenData,
			ctrlKey,
			shiftKey,
			altKey,
			key
		};

		const { newSelection, stateUpdates } = handleSelection(selectionContext);

		onSelectionChange(newSelection);
		if (stateUpdates) {
			this.setState(stateUpdates);
		}

		if (selectionContext.selectionType !== 'keyboard') {
			this._focusItemAt(selectionContext.currentActionIndex);
		}
	}

	_onChangeFocusedIndex = ({ key }: React.KeyboardEvent<HTMLUListElement>) => {
		if (key === 'ArrowUp' || key === 'ArrowDown') {
			const change = (key === 'ArrowUp') ? -1 : 1;
			this._focusItemAt(this._focusedIndex + change);
		}
	}

	_focusItemAt(index: number) {
		const newFocusedIndex = ensureRange(0, this._focusables.length - 1, index);
		this._focusedIndex = newFocusedIndex;
		this._focusables[newFocusedIndex].focus();
	}

	_getRef = (index: number, ref: TFocusable) => this._focusables[index] = ref

	render() {
		const { children, selection } = this.props;

		const childrenWithPassedProps = [].map.call(children, (childElement: React.ReactElement<TSelectableProps<DT>>, index: number) => {
			const selectableChildProps: TSelectableProps<DT> = {
				...childElement.props,
				onSelect: this._onSelectionChange,
				exposeElement: this._getRef,
				selected: selection.has(childElement.props.data),
				index,
			};

			return React.cloneElement(
				childElement,
				selectableChildProps,
				childElement.props.children
			);
		});

		return React.createElement(this.props.render, {
			tabIndex: 0,
			className: this._className,
			onKeyDown: this._onChangeFocusedIndex,
			children: childrenWithPassedProps
		});
	}
}

export { default as Selectable } from './Selectable';
