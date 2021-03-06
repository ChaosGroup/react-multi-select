import * as React from 'react';
import { TSelectionInfo, TSelectionEvent, SelectionType } from './handle-selection/types';

export interface TSelectableProps<DT> {
	render?: keyof HTMLElementTagNameMap;
	selected?: boolean;
	data: DT;
	className?: string;
	onSelect?: ((event: TSelectionEvent<HTMLLIElement>, selectionInfo: TSelectionInfo) => any);
	children: React.ReactNode;
	ref?: (ref: React.ReactInstance) => any;
	tabIndex?: number;
	disabled?: boolean;
}

type UserEventHandler = (event: TSelectionEvent<HTMLLIElement>) => void;

const FOCUS_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown']);

const _createOnSelect = <DT>(
	instance: Selectable<DT>,
	selectionType: SelectionType
): UserEventHandler => event => {
	if (!FOCUS_KEYS.has(event.key)) {
		event.stopPropagation();
	}

	if (!instance.props.disabled) {
		const { onSelect, data } = instance.props;
		onSelect(event, { data, selectionType });
	}
};

export default class Selectable<DT> extends React.PureComponent<TSelectableProps<DT>, Readonly<{}>> {
	public static defaultProps = {
		render: 'li',
		tabIndex: 0,
		disabled: false
	};

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

	private _onMouseSelect: UserEventHandler = _createOnSelect(this, 'mouse');
	private _onKeyboardSelect: UserEventHandler = _createOnSelect(this, 'keyboard');

	public render() {
		const { render, ...rest } = this.props;

		return React.createElement(render, {
			...rest,
			className: this._className,
			tabIndex: this._tabIndex,
			onClick: this._onMouseSelect,
			onKeyDown: this._onKeyboardSelect
		});
	}
}
