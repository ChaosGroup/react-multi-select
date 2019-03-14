import * as React from 'react';
import { getOsName } from './utils';

import handleSelection, { strategies as defaultStrategies } from './handle-selection/index';
import { TSelectableProps } from './Selectable';

import {
	TSelectionStrategy,
	TSelectionContext,
	SelectionAction,
	TSelectionInfo,
	TSelectionEvent,
	STRATEGY_NAME
} from './handle-selection';
import { OSName } from './constants';

export interface TMultiSelectState<DT> {
	lastAction: SelectionAction;
	lastData?: DT;
	[key: string]: any;
}

export interface TMultiSelectProps<DT> {
	render?: keyof HTMLElementTagNameMap;
	style?: { [style: string]: string };
	className?: string;
	selection: Set<DT>;
	children?: React.ReactNode;
	onSelectionChange: (selected: Set<DT>, context: TSelectionContext<DT>) => any;
	manageFocus?: boolean;
	strategies?: Array<TSelectionStrategy<DT> | STRATEGY_NAME>;
}

export * from './handle-selection';
export { default as Selectable } from './Selectable';

export default class MultiSelect<DT> extends React.PureComponent<
	TMultiSelectProps<DT>,
	Partial<TMultiSelectState<DT>>
> {
	public static defaultProps: Partial<TMultiSelectProps<any>> = {
		children: [],
		render: 'ul',
		manageFocus: true,
		className: '',
		style: {},
		strategies: Object.values(defaultStrategies)
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
		if (manageFocus && !this._walker && manageFocus !== this.props.manageFocus) {
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
		const childrenData = React.Children.map(
			this.props.children,
			(child: React.ReactElement<TSelectableProps<DT>>) => child.props.data
		);
		const selectionContext: TSelectionContext<DT> = {
			...selectionInfo,
			...this.state,
			selection: this.props.selection,
			lastAction: this.state.lastAction,
			childrenData,
			ctrlKey,
			shiftKey,
			altKey,
			key
		};

		const { newSelection, stateUpdates } = handleSelection(selectionContext, this.props.strategies);
		if (newSelection) {
			this.props.onSelectionChange(newSelection, selectionContext);
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
		const { render, children, selection, manageFocus, onSelectionChange, strategies, ...rest } = this.props;
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
			...rest,
			ref: (ref: Element) => this._multiselect = ref,
			tabIndex: -1,
			className: this._className,
			onKeyDown: manageFocus ? this._onChangeFocusedIndex : null,
			onClick: manageFocus ? this._onClick : null,
			children: childrenWithPassedProps
		});
	}
}
