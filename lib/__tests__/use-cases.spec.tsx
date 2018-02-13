import test from 'ava';
import * as React from 'react';
import { spy } from 'sinon';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import './helpers/browser';

import MultiSelect, { TMultiSelectProps } from '../index';
import Selectable from '../Selectable';

enzyme.configure({ adapter: new Adapter() });

type Point = {
	id: number;
	x: number;
	y: number;
}

type Tag = keyof HTMLElementTagNameMap;

class Test extends React.Component {
	state: {
		selection: Set<number>;
	}

	props: {
		points: Point[];
		renderM: Tag;
		renderS: Tag;
	}

	constructor(props) {
		super(props);
		this.state = { selection: new Set };
	}

	onSelectionChange = selection => this.setState({ selection })

	render() {
		const { renderS, renderM } = this.props;
		return (
			<MultiSelect
				selection={this.state.selection}
				onSelectionChange={this.onSelectionChange}
				render={renderM}
			>
				{
					this.props.points.map(p => <Selectable key={p.id} data={p.id} render={renderS}>[x = {p.x}, y = {p.y}]</Selectable>)
				}
			</MultiSelect>
		)
	}
}


const runTestsWithTags = (multiselectTag: Tag, selectableTag: Tag) => test('Combination of toggle, repeat action and select all works', assert => {
	const points = [
		{ x: 3, y: 4 },
		{ x: 10, y: 33 },
		{ x: -3, y: 0 },
		{ x: 4, y: -332 },
		{ x: -42, y: -42 },
		{ x: 22, y: 44 },
		{ x: 7575, y: 393 }
	].map((p, id) => ({ id, ...p }));

	const wrapper = enzyme.mount(<Test points={points} renderM={multiselectTag} renderS={selectableTag} />);
	const selection = () => wrapper.state().selection;

	// select first element to focus the list
	wrapper.find('Selectable').first().simulate('click');
	assert.is([...selection()], [points[0].id]);

	// select all elements
	wrapper.find('Selectable').first().simulate('keydown', { key: 'a', ctrlKey: true });
	assert.deepEqual(points.map(p => p.id), [...selection()].sort());

	// toggle some of the selections off
	for (const i of [1, 3, 4]) {
		assert.true(selection().has(i));
		wrapper.find('Selectable').at(i).simulate('click', { ctrlKey: true });
		assert.false(selection().has(i));
	}

	// toggle one selection on and off a few times
	// selection is preserved because of even amount of repetitions
	for(const i of [2, 3, 0, points.length - 1]) {
		const victim /* :D */ = wrapper.find('Selectable').at(i);
		for(let j = 0; j < 4; ++j) {
			const isInSelection = selection().has(i);
			victim.simulate('click', { ctrlKey: true });
			assert.not(selection().has(i), isInSelection);
		}
	}

	// selecta all again
	wrapper.find('Selectable').first().simulate('keydown', { key: 'a', ctrlKey: true });
	assert.deepEqual(points.map(p => p.id), [...selection()].sort());

	// unselect 3
	wrapper.find('Selectable').at(3).simulate('click', { ctrlKey: true });
	assert.false(selection().has(3));

	// unselect from 3 to 6 inclusive
	wrapper.find('Selectable').at(6).simulate('click', { shiftKey: true });
	[3, 4, 5, 6].forEach(id => assert.false(selection().has(id)));
	[0, 1, 2].forEach(id => assert.true(selection().has(id)));

	// toggle 5
	wrapper.find('Selectable').at(5).simulate('click', { ctrlKey: true });
	assert.true(selection().has(5));

	// select all from 5 to 1 inclusive
	wrapper.find('Selectable').at(1).simulate('click', { shiftKey: true });
	[0, 1, 2, 3, 4, 5].forEach(id => assert.true(selection().has(id)));
	assert.false(selection().has(6));

	// do some clicking
	for(const i of [0, 1, 2, 3, 6, 6, 4, 0]) {
		wrapper.find('Selectable').at(i).simulate('click');
		assert.deepEqual([...selection()], [i]);
	}
});

[
	['div', 'div'],
	['div', 'p'],
	['ul', 'li'],
	['ol', 'li'],
	['div', 'a']
].forEach(([m, s]: [Tag, Tag]) => runTestsWithTags(m, s));
