import React from 'react';
import MultiSelect, { Selectable, strategies } from '../../../dist/es6';

const selectEverySecond = {
    getStateUpdates: () => null,
    matches: {
        keyboard: ({ key, ctrlKey }) => key === '2' && ctrlKey
    },
    getNewSelection: selectionCtx => new Set(
        selectionCtx.childrenData.filter((_, i) => i % 2 !== 0)
    )
};

const STRATEGIES = [selectEverySecond].concat(Object.values(strategies));

export default class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selection: new Set };
        this.onSelectionChange = this.onSelectionChange.bind(this);
    }

    onSelectionChange(selection) {
        this.state.selection !== selection && this.setState({ selection });
    }

    render() {
        return (
            <div>
                <p>Press ctrl + 2 to select every second element</p>
                <MultiSelect
                    selection={this.state.selection}
                    strategies={STRATEGIES}
                    onSelectionChange={this.onSelectionChange}
                >
                    {
                        this.props.numbers.map(p => (
                            <Selectable key={p} data={p}>
                                {p}{this.state.selection.has(p) && ' <'}
                            </Selectable>
                        ))
                    }
                </MultiSelect>
            </div>
        );
    }
};

