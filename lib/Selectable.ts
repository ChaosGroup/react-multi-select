import * as React from 'react';
import { TSelectionInfo, TSelectionEvent, SelectionType, TFocusable } from './handle-selection/types';
import { MouseEvent, KeyboardEvent } from 'react';

export interface TSelectableProps<DT> {
	render?: keyof HTMLElementTagNameMap;
	selected?: boolean;
	data: DT;
	onSelect?: ((event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo) => any);
	index?: number;
	children: React.ReactNode;
	ref?: (ref: React.ReactInstance) => any;
	exposeElement?: (index: number, ref: { focus: () => void }) => any;
}

export default class Selectable<DT> extends React.PureComponent<TSelectableProps<DT>, Readonly<{}>> {
	public static defaultProps = {
		render: 'li'
	};

	private _element: HTMLInputElement;

	get _className() {
		const { selected } = this.props;

		return `multiselect__entry${selected ? ' selected' : ''}`;
	}

	private _createOnSelect = (selectionType: SelectionType) => (event: TSelectionEvent<HTMLLIElement>) => {
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

	private _exposeElement = (focusable: TFocusable) => this.props.exposeElement(this.props.index, focusable);

	public render() {
		return React.createElement(this.props.render, {
			ref: this._exposeElement,
			className: this._className,
			tabIndex: 0,
			onClick: this._onMouseSelect,
			onKeyDown: this._onKeyboardSelect,
			children: this.props.children
		});
	}
}
