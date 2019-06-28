# react-multi-select

[![Build Status](https://travis-ci.org/ChaosGroup/react-multi-select.svg?branch=master)](https://travis-ci.org/ChaosGroup/react-multi-select)
[![Coverage Status](https://coveralls.io/repos/github/ChaosGroup/react-multi-select/badge.svg?branch=master)](https://coveralls.io/github/ChaosGroup/react-multi-select?branch=master)
<br>
[![NPM](https://nodei.co/npm/@chaosgroup/react-multi-select.png)](https://npmjs.org/package/@chaosgroup/react-multi-select)

React components that provide multiple selection logic. Features mouse and keyboard selections. Can render arbitary tags as selectable items.

![quick example](./examples.gif)

```js
import React from 'react';
import MultiSelect, { Selectable } from '@chaosgroup/react-multi-select';

export default class SelectableParagraphs extends React.Component {
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
			<MultiSelect
				render="div"
				selection={selection}
				onSelectionChange={this.onSelectionChange}
			>
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
```

### Examples
1. [selectable paragraphs](./examples/stories/paragraphs/index.jsx)
2. [tree view](./examples/stories/nested-lists/index.jsx)
