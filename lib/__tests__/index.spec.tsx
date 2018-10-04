import './helpers/browser';
import test from 'ava';
import * as React from 'react';
import { mount } from 'enzyme';
import { spy } from 'sinon';
import { simulateFocus } from './helpers';

import MultiSelect, { Selectable, TMultiSelectProps } from '../index';
import { minSelectionContext, selectionCtx, noop, repeat } from './helpers';

const getSelectableProps = () => [
	'pesho',
	'gosho',
	'ivan',
	'stamatka',
	'natan'
].map((data, index) => ({
	key: data,
	selected: index % 2 === 0,
	data
}));

const getMinMultiSelectProps =
	<T extends {}>(selection: Set<T> = new Set): TMultiSelectProps<T> => ({
		selection,
		onSelectionChange: noop
	});

test('renders without crashing with valid minimal props', assert => {
	mount(
		<MultiSelect {...getMinMultiSelectProps<number>()}>
			<Selectable selected data={5}>5</Selectable>
		</MultiSelect>
	);

	assert.pass();
});

test('non-empty multiselect focuses the first selectable element on focus', assert => {
	const wrapper = mount(
		<MultiSelect selection={new Set} onSelectionChange={noop}>
			<Selectable data={5}>5</Selectable>
		</MultiSelect>
	);

	wrapper.simulate('focus');
	const firstSelectable = wrapper.find('Selectable').first().getDOMNode();
	assert.is(firstSelectable, document.activeElement);
});

test('propagates index, selected and focused properties to children', assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));

	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const renderedSelectables = wrapper.find('Selectable').getElements();

	for (const { props } of renderedSelectables) {
		const matchingProp = selectableProps.find(p => cmpKeys.every(k => p[k] === props[k]));
		const failMessage = `could not find matching prop for ${JSON.stringify(props)}`;
		assert.is(typeof matchingProp, 'object', failMessage);
	}
});

test('passes _onSelectionChange as onSelect to children', assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const renderedSelectables = wrapper.find('Selectable').getElements();

	for (const { props } of renderedSelectables) {
		assert.is(typeof props.onSelect, 'function');
	}
});

test('_onSelectionChange does not call props.onSelectionChange when no selection new selection', assert => {
	const props = { selection: new Set, onSelectionChange: spy() };
	const instance = mount(<MultiSelect {...props} />).instance();
	const noMatch = selectionCtx({
		altKey: true,
		selectionType: 'keyboard'
	});

	// tslint:disable-next-line no-string-literal
	instance['_onSelectionChange']({ altKey: true }, { selectionType: 'keyboard' });
	assert.false(props.onSelectionChange.called);
});

test(`doesn't focus another element when event.key is different from up/down arrow`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));

	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const firstSelectable = wrapper.find('Selectable').first();
	firstSelectable.simulate('click');

	for (const key of ['1', 'a', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
		wrapper.simulate('keydown', { key });
		assert.true(firstSelectable.getDOMNode() === document.activeElement);
	}
});

test(`keeps the first element focused when pressing up`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.find('Selectable').first().simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowUp' });
	const firstSelectable = wrapper.find('Selectable').first().getDOMNode();
	assert.true(firstSelectable === document.activeElement);
});

test(`focuses the previous item when current item is not the first`, assert => {
	const focusAt = 3;
	const selectableProps = getSelectableProps().concat([{ data: 'ze frig', key: 'umm', selected: false }]);
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const initial = wrapper.find('Selectable').at(focusAt);
	simulateFocus(wrapper, initial);
	wrapper.simulate('keydown', { key: 'ArrowUp' });

	const expectedFocused = wrapper.find('Selectable').at(focusAt - 1).getDOMNode();
	assert.true(expectedFocused === document.activeElement);
});

test(`keeps the last element focused when the down arrow is pressed`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const last = wrapper.find('Selectable').last();
	simulateFocus(wrapper, last);
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.true(last.getDOMNode() === document.activeElement);
});

test(`focuses next item when event.key is down arrow and current item is not the last`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.find('Selectable').first().simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.true(wrapper.find('Selectable').at(1).getDOMNode() === document.activeElement);
});

test(`allows to provide custom classes`, assert => {
	const wrapper = mount(<MultiSelect className="penka" {...getMinMultiSelectProps()} />);
	const className = wrapper.getDOMNode().className;
	assert.is(className, 'multiselect penka');
});

test('does not change focus on up/down arrow when focus management is disabled', assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);
	const wrapper = mount(<MultiSelect {...multiSelectProps} manageFocus={false} children={selectables} />);

	const expectedActiveElement = document.activeElement;
	repeat(5, () => wrapper.simulate('keydown', { key: 'ArrowDown' }));

	assert.true(expectedActiveElement === document.activeElement);
});

test('starts managing focus when props.manageFocus changes to true', assert => {
	type TState = { manageFocus: boolean; };
	type TProps = {};
	class ToggleManageFocus extends React.Component<TProps, TState> {
		constructor(props) {
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
	const multiselectWrapper = wrapper.find('MultiSelect');
	const selectables = () => multiselectWrapper.find('Selectable');
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
