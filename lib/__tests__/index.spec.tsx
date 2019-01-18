import './helpers/browser';
import * as fc from 'fast-check';
import * as React from 'react';
import { mount } from 'enzyme';

import MultiSelect, { Selectable } from '../index';
import {
	simulateFocus,
	noop,
	repeat,
	prop
} from './helpers';

const nonListTags: Array<keyof HTMLElementTagNameMap> = ['div', 'span', 'p', 'strong'];
const listTags: Array<keyof HTMLElementTagNameMap> = ['ul', 'ol'];

const arbitraryMultiSelectProps = (minChildrenCount: number = 1) => fc.constantFrom(nonListTags, listTags)
	.chain(tags => fc.tuple(
		fc.constantFrom(...tags),
		tags === listTags
			? fc.constant('li' as keyof HTMLElementTagNameMap)
			: fc.constantFrom(...nonListTags),
		fc.set(fc.integer(), minChildrenCount, 100).map(set => [...set])
	))
	.chain(([render, selectableRender, data]) => fc.record({
		selection: fc.shuffledSubarray(data).map(sa => new Set(sa)),
		onSelectionChange: fc.constant(noop),
		children: fc.constant(
			data.map(d => <Selectable key={d} data={d} render={selectableRender}>{d}</Selectable>)
		),
		render: fc.constant(render)
	}));

prop(
	'does not crash when rendering with valid props',
	arbitraryMultiSelectProps(),
	props => {
		mount(<MultiSelect {...props} />);
		return true;
	}
);
prop(
	'non-empty multiselect focuses the first selectable element on focus',
	arbitraryMultiSelectProps(),
	props => {
		const wrapper = mount(<MultiSelect {...props} />);
		wrapper.simulate('focus');
		const firstSelectable = wrapper.find(Selectable).first().getDOMNode();
		return firstSelectable === document.activeElement;
	}
);

prop(
	'propagates index, selected and onSelect properties to child elements',
	arbitraryMultiSelectProps(),
	multiSelectProps => {
		const wrapper = mount(<MultiSelect {...multiSelectProps} />);
		const renderedSelectables = wrapper.find(Selectable).getElements();

		return renderedSelectables.every(({ props }, i) => {
			const correctSelected = props.selected === multiSelectProps.selection.has(props.data);
			const hasCorrectIndex = props.index === i;
			const hasCorrectOnSelect = typeof props.onSelect === 'function';
			return correctSelected && hasCorrectIndex && hasCorrectOnSelect;
		});
	}
);

prop(
	`never focuses another element when event.key is different from up/down arrow`,
	fc.tuple(
		fc.constant(['1', 'a', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'w', 's']),
		arbitraryMultiSelectProps()
	),
	([keys, props]) => {
		const wrapper = mount(<MultiSelect {...props} />);
		const firstSelectable = wrapper.find(Selectable).first();
		firstSelectable.simulate('click');

		const domNode = firstSelectable.getDOMNode();
		return keys.every(key => {
			wrapper.simulate('keydown', { key });
			return domNode === document.activeElement;
		});
	}
);

prop(
	`first element is always remains focused when pressing up after it has been focused`,
	fc.tuple(
		fc.nat(50),
		arbitraryMultiSelectProps()
	),
	([upCount, props]) => {
		const wrapper = mount(<MultiSelect {...props} />);
		wrapper.find(Selectable).first().simulate('click');
		const firstSelectable = wrapper.find(Selectable).first().getDOMNode();
		for (let i = 0; i < upCount; ++i) {
			wrapper.simulate('keydown', { key: 'ArrowUp' });
			if (firstSelectable !== document.activeElement) {
				return false;
			}
		}
	}
);

prop(
	`previous item is always focused when current item is not the first`,
	arbitraryMultiSelectProps(2).chain(props => fc.tuple(
		fc.nat(props.children.length - 1),
		fc.constant(props)
	)),
	([startIndex, props]) => {
		const wrapper = mount(<MultiSelect {...props} />);
		const initial = wrapper.find(Selectable).at(startIndex);
		simulateFocus(wrapper, initial);
		while (startIndex > 0) {
			wrapper.simulate('keydown', { key: 'ArrowUp' });
			startIndex--;
			const expectedFocused = wrapper.find(Selectable)
				.at(startIndex)
				.getDOMNode();
			if (expectedFocused !== document.activeElement) {
				return false;
			}
		}
	}
);

/*
 * TODO: fails, fix
prop(
	`keeps the last element focused when the down arrow is pressed`,
	fc.tuple(
		fc.nat(50),
		arbitraryMultiSelectProps()
	),
	([downCount, props]) => {
		const wrapper = mount(<MultiSelect {...props} />);
		const last = wrapper.find(Selectable).last();
		last.simulate('click');
		const domNode = last.getDOMNode();

		for (let i = 0; i < downCount; ++i) {
			wrapper.simulate('keydown', { key: 'ArrowDown' });
			if (domNode === document.activeElement) {
				return false;
			}
		}
	}
);
*/

/* TODO: fails, fix
test(`focuses next item when event.key is down arrow and current item is not the last`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.find(Selectable).first().simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.true(wrapper.find(Selectable).at(1).getDOMNode() === document.activeElement);
});
*/

prop(
	`allows to provide custom classes`,
	fc.tuple(fc.string(1, 20), arbitraryMultiSelectProps()),
	([className, props]) => {
		const wrapper = mount(<MultiSelect className={className} {...props} />);
		return wrapper.getElement().props.className === className;
	}
);

prop(
	'does not change focus on up/down arrow when focus management is disabled',
	arbitraryMultiSelectProps(),
	props => {
		const wrapper = mount(<MultiSelect {...props} manageFocus={false} />);

		const expectedActiveElement = document.activeElement;
		repeat(5, () => wrapper.simulate('keydown', { key: 'ArrowDown' }));

		return expectedActiveElement === document.activeElement;
	}
);

/*
 * TODO: fails, fix
test('starts managing focus when props.manageFocus changes to true', assert => {
	type TState = { manageFocus: boolean; };
	type TProps = {};
	class ToggleManageFocus extends React.Component<TProps, TState> {
		constructor(props: TProps) {
			super(props);
			this.state = { manageFocus: false };
		}

		public render() {
			const { manageFocus } = this.state;
			const selectableProps = getSelectableProps();
			const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
			const multiSelectProps = getMinMultiSelectProps(selection);

			const selectableChildren = selectableProps.map((props, key) => (
				<Selectable key={key} {...props}>{props.data}</Selectable>
			));
			return <MultiSelect {...multiSelectProps} manageFocus={manageFocus} children={selectableChildren} />;
		}
	}

	const wrapper = mount(<ToggleManageFocus />);
	const multiselectWrapper = wrapper.find(MultiSelect);
	const selectables = () => multiselectWrapper.find(Selectable);
	const focusAt = 4;
	assert.true(selectables().length > focusAt);

	simulateFocus(multiselectWrapper, selectables().at(0));
	const initialActiveElement = document.activeElement;
	repeat(focusAt, () => multiselectWrapper.simulate('keydown', { key: 'ArrowDown' }));

	assert.true(initialActiveElement === document.activeElement);

	wrapper.setState({ manageFocus: true });
	simulateFocus(multiselectWrapper, selectables().at(0));
	repeat(focusAt, () => multiselectWrapper.simulate('keydown', { key: 'ArrowDown' }));

	const last = selectables().at(focusAt).getDOMNode();
	assert.true(last === document.activeElement);
});
*/
