import React from 'react';
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

	_renderList(items) {
		if (typeof items === 'string') {
			return <Selectable key={items} data={items}>{items}</Selectable>;
		}

		const selectables = items.map(this._renderList);
		return (
			<MultiSelect
				selection={this.state.selection}
				onSelectionChange={this.onSelectionChange}
				children={selectables}
			/>
		);
	}

	render() {
		const { selection } = this.state;
		const { data } = this.props;

		return this._renderList(data);
	}
};
