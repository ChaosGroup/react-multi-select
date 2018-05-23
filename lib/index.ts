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
	manageFocus?: boolean;
}

export default class MultiSelect<DT> extends React.PureComponent<TMultiSelectProps<DT>, Partial<TMultiSelectState>> {
	public static defaultProps: Partial<TMultiSelectProps<any>> = {
		children: [],
		render: 'ul',
		manageFocus: true,
		className: ''
	};
	public static getOsName: () => OSName = getOsName;

	private static _getNextFocusable(walker: TreeWalker, forward: boolean): HTMLElement {
		const move = forward ? () => walker.nextNode() : () => walker.previousNode();
		const last = walker.currentNode;

		while (true) {
			const current = move();
			if (!current) {
				walker.currentNode = last;
				break;
			}

			const { classList } = walker.currentNode as HTMLElement;
			const isSelectable = classList.contains('multiselect__entry');
			const isDisabled = classList.contains('disabled');

			if (isSelectable && !isDisabled) {
				break;
			}
		}

		return walker.currentNode as HTMLElement;
	}

	private _multiselect: Element;
	private _walker: TreeWalker;

	constructor(props: TMultiSelectProps<DT>) {
		super(props);

		this.state = {
			lastActionIndex: 0,
			lastAction: 'add'
		};
	}

	public componentWillReceiveProps({ manageFocus }: TMultiSelectProps<DT>) {
		if (manageFocus && manageFocus !== this.props.manageFocus) {
			this._initWalker();
		}
	}

	public componentDidMount() {
		if (this.props.manageFocus) {
			this._initWalker();
		}
	}

	get _className() {
		return 'multiselect ' + this.props.className;
	}

	private _initWalker() {
		this._walker = document.createTreeWalker(
			this._multiselect,
			NodeFilter.SHOW_ELEMENT,
			{
				acceptNode: (node: HTMLElement) => {
					const tabIndex = parseInt(node.getAttribute('tabindex'));
					return Number.isNaN(tabIndex) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
				}
			},
			false
		);

		MultiSelect._getNextFocusable(this._walker, true).focus();
	}

	get _isMacOs() {
		return MultiSelect.getOsName() === OSName.MAC;
	}

	private _onSelectionChange = (event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo): void => {
		const { target, ctrlKey: ctrl, shiftKey, altKey, metaKey, key = '' } = event;
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
	}

	private _onChangeFocusedIndex = ({ key }: React.KeyboardEvent<HTMLUListElement>) => {
		const goForward = key === 'ArrowDown';
		const goBackward = key === 'ArrowUp';

		if (goForward || goBackward) {
			MultiSelect._getNextFocusable(this._walker, goForward).focus();
		}
	}

	private _onClick = () => this._walker.currentNode = document.activeElement;

	public render() {
		const { render, children, selection, manageFocus } = this.props;
		const childrenWithPassedProps = React.Children.map(
			children,
			(childElement: React.ReactElement<TSelectableProps<DT>>, index: number) => {
				const selectableChildProps: TSelectableProps<DT> = {
					...childElement.props,
					onSelect: this._onSelectionChange,
					selected: selection.has(childElement.props.data),
					index,
				};

				return React.cloneElement(
					childElement,
					selectableChildProps,
					childElement.props.children
				);
			});

		return React.createElement(render, {
			ref: (ref: Element) => this._multiselect = ref,
			tabIndex: -1,
			className: this._className,
			onKeyDown: manageFocus ? this._onChangeFocusedIndex : null,
			onClick: manageFocus ? this._onClick : null,
			children: childrenWithPassedProps
		});
	}
}

export { default as Selectable } from './Selectable';
