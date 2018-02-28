import test from 'ava';
import * as React from 'react';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import './helpers/browser';

import MultiSelect, { TMultiSelectProps } from '../index';
import Selectable from '../Selectable';
import { minSelectionContext, selectionCtx, noop } from './helpers';

enzyme.configure({ adapter: new Adapter() });
const { shallow, mount } = enzyme;

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
	shallow(
		<MultiSelect {...getMinMultiSelectProps<number>()}>
			<Selectable selected data={5}>5</Selectable>
		</MultiSelect>
	);

	assert.pass();
});

test('empty multiselect does not crash on focus', assert => {
	const wrapper = mount(<MultiSelect selection={new Set} onSelectionChange={noop} />);
	wrapper.simulate('focus');
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

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = shallow(<MultiSelect {...multiSelectProps} children={selectables} />);
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

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = shallow(<MultiSelect {...multiSelectProps} children={selectables} />);
	const renderedSelectables = wrapper.find('Selectable').getElements();

	for (const { props } of renderedSelectables) {
		assert.is(typeof props.onSelect, 'function');
	}
});

test(`doesn't focus another element when event.key is different from up/down arrow`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));

	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const firstSelectable = wrapper.find('Selectable').first();
	firstSelectable.simulate('click');

	for (const key of ['1', 'a', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
		wrapper.simulate('keydown', { key });
		assert.is(firstSelectable.getDOMNode(), document.activeElement);
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
	assert.is(firstSelectable, document.activeElement);
});

test(`focuses the previous item when current item is not the first`, assert => {
	const focusAt = 3;
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.find('Selectable').at(focusAt).simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowUp' });

	assert.is(wrapper.find('Selectable').at(focusAt - 1).getDOMNode(), document.activeElement);
});

test(`keeps the last element focused when the down arrow is pressed`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const last = wrapper.find('Selectable').last();
	last.simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.is(last.getDOMNode(), document.activeElement);
});

test(`focuses next item when event.key is down arrow and current item is not the last`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map((props, key) => <Selectable key={key} {...props}>{props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.find('Selectable').first().simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.is(wrapper.find('Selectable').at(1).getDOMNode(), document.activeElement);
});

test(`allows to provide custom classes`, assert => {
	const wrapper = mount(<MultiSelect className="penka" {...getMinMultiSelectProps()} />);
	const className = wrapper.getDOMNode().className;
	assert.is(className, 'multiselect penka');
});
