import React from 'react';
import MultiSelect, { Selectable } from '../../../dist/es6';

import './index.css';

export default class Paragraphs extends React.Component {
	constructor(props) {
		super(props);
		this.state = { selection: new Set };
		this.onSelectionChange = this.onSelectionChange.bind(this);
	}

	onSelectionChange(selection) {
		this.state.selection !== selection && this.setState({ selection });
	}

	render() {
		const { selection } = this.state;

		return (
			<MultiSelect render="div" selection={selection} onSelectionChange={this.onSelectionChange}>
				{
					this.props.texts.map(p => (
						<Selectable render="p" key={p} data={p}>
							{p}{selection.has(p) && ' <'}
						</Selectable>
					))
				}
			</MultiSelect>
		);
	}
};
