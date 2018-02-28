import * as React from 'react';
import { ensureRange, getOsName } from './utils';

import handleSelection from './handle-selection/index';
import { TSelectableProps } from './Selectable';

import {
	TSelectionContext,
	SelectionAction,
	TSelectionInfo,
	TSelectionEvent,
	TFocusable
} from './handle-selection/types';
import { OSName } from './constants';

export interface TMultiSelectState {
	lastAction: SelectionAction;
	lastActionIndex: number;
}

export interface TMultiSelectProps<DT> {
	render?: keyof HTMLElementTagNameMap;
	className?: string;
	selection: Set<DT>;
	children?: React.ReactNode;
	onSelectionChange: (selected: Set<DT>) => any;
}

export default class MultiSelect<DT> extends React.PureComponent<TMultiSelectProps<DT>, Partial<TMultiSelectState>> {
	public static defaultProps: Partial<TMultiSelectProps<any>> = {
		children: [],
		render: 'ul'
	};
	public static getOsName: () => OSName = getOsName;

	private _focusedIndex: number;
	private _focusables: TFocusable[];
	private _multiselect: Element;

	constructor(props: TMultiSelectProps<DT>) {
		super(props);

		this.state = {
			lastActionIndex: 0,
			lastAction: 'add'
		};
		this._focusables = [];
	}

	get _className() {
		return 'multiselect ' + this.props.className;
	}

	get _isMacOs() {
		return MultiSelect.getOsName() === OSName.MAC;
	}

	private _onSelectionChange = (event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo): void => {
		const { ctrlKey: ctrl, shiftKey, altKey, metaKey, key = '' } = event;
		const ctrlKey = this._isMacOs ? metaKey : ctrl;
		const { selection, onSelectionChange } = this.props;
		const { lastAction, lastActionIndex } = this.state;
		const childrenData = React.Children.map(
			this.props.children,
			(child: React.ReactElement<TSelectableProps<DT>>) => child.props.data
		);
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
		if (newSelection) {
			onSelectionChange(newSelection);
		}

		if (stateUpdates) {
			this.setState(stateUpdates);
		}

		if (selectionContext.selectionType !== 'keyboard') {
			this._focusables[selectionContext.currentActionIndex].focus();
		}
	}

	private _onChangeFocusedIndex = ({ key }: React.KeyboardEvent<HTMLUListElement>) => {
		const { nextSibling, previousSibling } = document.activeElement;
		if (key === 'ArrowDown' && nextSibling) {
			(nextSibling as HTMLInputElement).focus();
		} else if (key === 'ArrowUp' && previousSibling) {
			(previousSibling as HTMLInputElement).focus();
		}
	}

	private _getRef = (index: number, ref: TFocusable) => this._focusables[index] = ref;

	private _onFocus = (event: UIEvent) => {
		if (event.target === this._multiselect && this._focusables.length > 0) {
			this._focusables[0].focus();
		}
	}

	private _ref = (ref: Element) => this._multiselect = ref;

	public render() {
		const { children, selection } = this.props;
		const childrenWithPassedProps = React.Children.map(
			children,
			(childElement: React.ReactElement<TSelectableProps<DT>>, index: number) => {
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
			ref: this._ref,
			tabIndex: 0,
			onFocus: this._onFocus,
			className: this._className,
			onKeyDown: this._onChangeFocusedIndex,
			children: childrenWithPassedProps
		});
	}
}

export { default as Selectable } from './Selectable';
