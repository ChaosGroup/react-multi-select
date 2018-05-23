import React, { Children } from 'react';
import MultiSelect, { Selectable } from '../../../dist/es6';

import './index.css';

export default class NestedLists extends React.Component {
	constructor(props) {
		super(props);
		this.state = { selection: new Set };
		this.onSelectionChange = this.onSelectionChange.bind(this);
		this._renderList = this._renderList.bind(this);
	}

	onSelectionChange(selection) {
		this.state.selection !== selection && this.setState({ selection });
		console.log(selection);
	}

	_renderList({ name, entries = [] }, root = true) {
		const selectable = <Selectable data={name} key={name}>{name}</Selectable>;
		if (entries.length === 0) {
			return selectable;
		}

		const multiselect = (
			<MultiSelect
				onSelectionChange={this.onSelectionChange}
				selection={this.state.selection}
				key={name}
				manageFocus={root}
			>
				{entries.map(e => this._renderList(e, false))}
			</MultiSelect>
		);

		return root ? multiselect : [
			selectable,
			<Selectable disabled>{multiselect}</Selectable>
		];
	}

	render() {
		return this._renderList(this.props.data);
	}
};
