import React, { Component } from 'react';
import MultiSelect, { Selectable } from 'react-multi-select';

const ps = [
	'gosho',
	'pesho',
	'shosho',
	'tosho'
];

class App extends Component {
	constructor(props) {
		super(props);
		this.state = { selection: new Set };
	}

	onSelectionChange = selection => this.setState({ selection })

	render() {
		const { selection } = this.state;

		return (
			<MultiSelect render="div" selection={selection} onSelectionChange={this.onSelectionChange}>
				{
					ps.map(p => (
						<Selectable render="p" key={p} data={p}>
							{p}{selection.has(p) && ' <'}
						</Selectable>
					))
				}
			</MultiSelect>
		);
	}
}

export default App;
