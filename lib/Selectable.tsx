import * as React from 'react';
import { TSelectionInfo, TSelectionEvent, SelectionType } from './handle-selection/types';
import { MouseEvent, KeyboardEvent } from 'react';

export interface TSelectableProps<DT> {
	selected: boolean | undefined;
	focused: boolean | undefined;
	data: DT;
	onSelect: (event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo) => any;
	onBlur: (childIndex: number) => any;
	index: number;
	children: JSX.Element;
}

const FOCUS_REF_PROP = { ref: (focusable: HTMLLIElement) => focusable && focusable.focus() };
const EMPTY = {};

export default class Selectable<DT> extends React.PureComponent<TSelectableProps<DT>, Readonly<{}>> {
	get _className() {
		const { selected } = this.props;

		return `multiselect__entry${selected ? '--selected' : ''}`;
	}

	get _refProps(): { ref?: (r: HTMLLIElement) => any } {
		return this.props.focused ? FOCUS_REF_PROP : EMPTY;
	}

	_createOnSelect = (selectionType: SelectionType) => (event: TSelectionEvent<HTMLLIElement>) => {
		const { onSelect, data, index } = this.props;
		const selectionInfo = {
			data,
			selectionType,
			currentActionIndex: index
		};

		onSelect(event, selectionInfo);
	}

	_onMouseSelect = this._createOnSelect('mouse')
	_onKeyboardSelect = this._createOnSelect('keyboard')

	_onBlur = () => this.props.onBlur(this.props.index)

	render() {
		return (
			<li
				{...this._refProps}
				className={this._className}
				tabIndex={0}
				onBlur={this._onBlur}
				onClick={this._onMouseSelect}
				onKeyDown={this._onKeyboardSelect}
			>
				{this.props.children}
			</li>
		);
	}
}
