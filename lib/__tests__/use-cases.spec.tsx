import './helpers/browser';
import test from 'ava';
import * as React from 'react';
import * as enzyme from 'enzyme';
import { simulateFocus } from './helpers';

import MultiSelect, { Selectable } from '../';
import { OSName } from '../constants';

type Point = {
	id: number;
	x: number;
	y: number;
};

type Tag = keyof HTMLElementTagNameMap;

type Props = {
	points: Point[];
	renderM: Tag;
	renderS: Tag;
};


class Test extends React.Component {
	public state: {
		selection: Set<number>;
	};

	public props: Props;

	constructor(props: Props) {
		super(props);
		this.state = { selection: new Set };
	}

	public onSelectionChange = (selection: Set<number>) => this.setState({ selection });

	public render() {
		const { renderS, renderM } = this.props;
		const points = this.props.points.map(p => (
			<Selectable
				key={p.id}
				data={p.id}
				render={renderS}
			>
				[x = {p.x}, y = {p.y}]
			</Selectable>
		));
		return (
			<MultiSelect
				selection={this.state.selection}
				onSelectionChange={this.onSelectionChange}
				render={renderM}
			>
				{points}
			</MultiSelect>
		);
	}
}

const getTestData = () => [
	{ x: 3, y: 4 },
	{ x: 10, y: 33 },
	{ x: -3, y: 0 },
	{ x: 4, y: -332 },
	{ x: -42, y: -42 },
	{ x: 22, y: 44 },
	{ x: 7575, y: 393 }
];

const runTestsWithTags = (multiselectTag: Tag, selectableTag: Tag) => test(
	`Combination of toggle/repeat/select all works for multiselect ${multiselectTag} and selectables ${selectableTag}`,
	assert => {
		const points = getTestData().map((p, id) => ({ id, ...p }));

		const wrapper = enzyme.mount(<Test points={points} renderM={multiselectTag} renderS={selectableTag} />);
		const selection = () => wrapper.state().selection;

		// select first element to focus the list
		wrapper.find(Selectable).first().simulate('click');
		assert.deepEqual([...selection()], [points[0].id]);

		// select all elements
		wrapper.find(Selectable).first().simulate('keydown', { key: 'a', ctrlKey: true });
		assert.deepEqual(points.map(p => p.id), [...selection()].sort());

		// toggle some of the selections off
		for (const i of [1, 3, 4]) {
			assert.true(selection().has(i));
			wrapper.find(Selectable).at(i).simulate('click', { ctrlKey: true });
			assert.false(selection().has(i));
		}

		// toggle one selection on and off a few times
		// selection is preserved because of even amount of repetitions
		for (const i of [2, 3, 0, points.length - 1]) {
			const victim /* :D */ = wrapper.find(Selectable).at(i);
			for (let j = 0; j < 4; ++j) {
				const isInSelection = selection().has(i);
				victim.simulate('click', { ctrlKey: true });
				assert.not(selection().has(i), isInSelection);
			}
		}

		// selecta all again
		wrapper.find(Selectable).first().simulate('keydown', { key: 'a', ctrlKey: true });
		assert.deepEqual(points.map(p => p.id), [...selection()].sort());

		// unselect 3
		wrapper.find(Selectable).at(3).simulate('click', { ctrlKey: true });
		assert.false(selection().has(3));

		// unselect from 3 to 6 inclusive
		wrapper.find(Selectable).at(6).simulate('click', { shiftKey: true });
		[3, 4, 5, 6].forEach(id => assert.false(selection().has(id)));
		[0, 1, 2].forEach(id => assert.true(selection().has(id)));

		// toggle 5
		wrapper.find(Selectable).at(5).simulate('click', { ctrlKey: true });
		assert.true(selection().has(5));

		// selection only 5
		wrapper.find(Selectable).at(5).simulate('click');

		// select all from 5 to 1 inclusive
		wrapper.find(Selectable).at(1).simulate('click', { shiftKey: true });
		[1, 2, 3, 4, 5].forEach(id => assert.true(selection().has(id)));
		assert.false(selection().has(6));

		// do some clicking
		for (const i of [0, 1, 2, 3, 6, 6, 4, 0]) {
			const ithSelectable = wrapper.find(Selectable).at(i);
			ithSelectable.simulate('click');
			simulateFocus(wrapper, ithSelectable);
			// check if selection works
			assert.deepEqual([...selection()], [i]);
			// check if focus works
			assert.true(ithSelectable.getDOMNode() === document.activeElement);
		}
		wrapper.find(Selectable).first().simulate('click');
		const moveDownCount = 3;
		Array.from({ length: moveDownCount })
			.forEach(() => wrapper.simulate('keydown', { key: 'ArrowDown' }));

		assert.true(wrapper.find(Selectable).at(moveDownCount).getDOMNode() === document.activeElement);

		wrapper.simulate('keydown', { key: 'ArrowUp' });
		assert.true(wrapper.find(Selectable).at(moveDownCount - 1).getDOMNode() === document.activeElement);
	}
);

const testCases = [
	['div', 'div'],
	['div', 'p'],
	['ul', 'li'],
	['ol', 'li'],
	['div', 'a']
];

testCases.forEach(([m, s]: [Tag, Tag]) => runTestsWithTags(m, s));

type ToggleTestOptions = {
	platform: OSName;
	title: string;
	toggle: (node: enzyme.ReactWrapper) => void;
	plainClick: (node: enzyme.ReactWrapper) => void;
};

const testToggleOnPlatform = (options: ToggleTestOptions) => test(options.title, assert => {
	const getOsNameMock = () => options.platform;
	const { getOsName } = MultiSelect;
	try {
		MultiSelect.getOsName = getOsNameMock;
		const points = getTestData().map((p, id) => ({ id, ...p }));

		const wrapper = enzyme.mount(<Test points={points} renderM="ul" renderS="li" />);
		const selection = () => wrapper.state().selection;
		const { toggle, plainClick } = options;

		assert.is(selection().size, 0);
		const selectable = wrapper.find(Selectable).first();
		toggle(selectable);
		assert.is(selection().size, 1);
		toggle(selectable);
		assert.is(selection().size, 0);

		const start = 1;
		const end = 3;
		wrapper.find(Selectable).slice(start, end).forEach(toggle);
		assert.is(selection().size, end - start);

		wrapper
			.find(Selectable)
			.slice(start, end)
			.forEach(s => {
				plainClick(s);
				assert.is(selection().size, 1);
			});
	} catch (error) {
		assert.fail(String(error));
	} finally {
		MultiSelect.getOsName = getOsName;
	}
});

const toggleTestCases: ToggleTestOptions[] = [
	{
		platform: OSName.MAC,
		title: 'toggle matches command + click but not ctrl + click on darwin',
		toggle: node => node.simulate('click', { metaKey: true }),
		plainClick: node => node.simulate('click', { ctrlKey: true })
	},
	{
		platform: OSName.OTHER,
		title: 'toggle matches ctrl + click but not metaKey + click when not on darwin',
		toggle: node => node.simulate('click', { ctrlKey: true }),
		plainClick: node => node.simulate('click', { metaKey: true })
	}
];

toggleTestCases.forEach(testToggleOnPlatform);
