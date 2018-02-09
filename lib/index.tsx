import * as React from 'react';
import { ensureRange } from './utils';

import handleSelection from './handle-selection/index';
import { TSelectableProps } from './Selectable';

import {
	TSelectionContext,
	SelectionAction,
	TSelectionInfo,
	TSelectionEvent
} from './handle-selection/types';

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
	constructor(props: TMultiSelectProps<DT>) {
		super(props);

		this.state = {
			lastActionIndex: 0,
			lastAction: 'add',
			focusedIndex: null
		};
	}

	static defaultProps: Partial<TMultiSelectProps<any>> = {
		children: [],
		render: 'ul'
	}

	_onSelectionChange = (event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo): void => {
		const { ctrlKey, shiftKey, altKey, key = '' } = event;
		const { selection, onSelectionChange } = this.props;
		const { lastAction, lastActionIndex } = this.state;
		const children = [].slice.call(this.props.children);

		const selectionContext: TSelectionContext<DT> = {
			...selectionInfo,
			selection,
			lastAction,
			lastActionIndex,
			children,
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
	}

	_onChangeFocusedIndex = ({ key }: React.KeyboardEvent<HTMLUListElement>) => {
		if (key !== 'ArrowUp' && key !== 'ArrowDown') {
			return;
		}

		const children = this.props.children as React.ReactElement<TSelectableProps<DT>>[];
		const { focusedIndex } = this.state;

		const change = (key === 'ArrowUp') ? -1 : 1;
		const newFocusedIndex = ensureRange(0, children.length - 1, (focusedIndex || 0) + change);

		this.setState({ focusedIndex: newFocusedIndex });
	}

	_onChildBlur = (childIndex: number) => {
		if (this.state.focusedIndex === childIndex) {
			this.setState({ focusedIndex: null });
		}
	}

	get _className() {
		return 'multiselect ' + this.props.className;
	}

	render() {
		const {
			children,
			selection
		} = this.props;

		const { focusedIndex } = this.state;

		const childrenWithPassedProps = [].map.call(children, (childElement: React.ReactElement<TSelectableProps<DT>>, index: number) => {
			const selected = selection.has(childElement.props.data);
			const focused = focusedIndex === index;

			const selectableChildProps: TSelectableProps<DT> = {
				...childElement.props,
				onSelect: this._onSelectionChange,
				onBlur: this._onChildBlur,
				index,
				selected,
				focused
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
