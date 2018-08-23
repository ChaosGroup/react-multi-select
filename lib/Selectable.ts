import * as React from 'react';
import { TSelectionInfo, TSelectionEvent, SelectionType, TFocusable } from './handle-selection/types';
import { MouseEvent, KeyboardEvent } from 'react';

export interface TSelectableProps<DT> {
	render?: keyof HTMLElementTagNameMap;
	selected?: boolean;
	data: DT;
	className?: string;
	onSelect?: ((event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo) => any);
	index?: number;
	children: React.ReactNode;
	ref?: (ref: React.ReactInstance) => any;
	tabIndex?: number;
	disabled?: boolean;
}

export default class Selectable<DT> extends React.PureComponent<TSelectableProps<DT>, Readonly<{}>> {
	public static defaultProps = {
		render: 'li',
		tabIndex: 0,
		disabled: false
	};

	private _element: HTMLInputElement;

	get _className() {
		const { selected, disabled, className } = this.props;
		const names = [
			selected && 'selected',
			disabled && 'disabled',
			className
		].filter(Boolean).join(' ');

		return `multiselect__entry${names.length ? ' ' + names : ''}`;
	}

	get _tabIndex() {
		const { disabled, tabIndex } = this.props;
		return disabled ? -1 : tabIndex;
	}

	private _createOnSelect = (selectionType: SelectionType) => (event: TSelectionEvent<HTMLLIElement>) => {
		if (this.props.disabled) {
			return;
		}

		const { onSelect, data, index } = this.props;
		const selectionInfo = {
			data,
			selectionType,
			currentActionIndex: index
		};

		onSelect(event, selectionInfo);
	}

	private _onMouseSelect = this._createOnSelect('mouse');
	private _onKeyboardSelect = this._createOnSelect('keyboard');

	public render() {
		const { render } = this.props;

		return React.createElement(render, {
			...this.props,
			className: this._className,
			tabIndex: this._tabIndex,
			onClick: this._onMouseSelect,
			onKeyDown: this._onKeyboardSelect
		});
	}
}
