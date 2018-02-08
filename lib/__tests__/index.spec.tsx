import test from 'ava';
import * as React from 'react';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import './helpers/browser';

import MultiSelect, { TMultiSelectProps } from '../index';
import Selectable from '../Selectable';
import { minSelectionContext, selectionCtx } from './helpers';

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
	focused: false,
	data
}));

const getMinMultiSelectProps = function <T>(selection: Set<T> = new Set): TMultiSelectProps<T> {
	return {
		selection,
		onSelectionChange: (selected: Set<T>) => { }
	}
};

test('renders without crashing with valid minimal props', assert => {
	const selectableProps = {
		selected: true,
		focused: true,
		data: 5,
		index: 0
	};

	shallow(
		<MultiSelect {...getMinMultiSelectProps<number>() }>
			<Selectable {...selectableProps}>{selectableProps.data}</Selectable>
		</MultiSelect>
	);

	assert.pass();
});

test('propagates index, selected and focused properties to children', assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));

	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = shallow(<MultiSelect {...multiSelectProps} children={selectables} />);
	const renderedSelectables = wrapper.find('Selectable').getElements();

	for (const { props } of renderedSelectables) {
		const matchingProp = selectableProps.find(p => cmpKeys.every(k => p[k] === props[k]));
		const failMessage = `could not find matching prop for ${JSON.stringify(props)}`;
		assert.is(typeof matchingProp, 'object', failMessage);
	}
});

test('passes _onSelectionChange as onSelect and _onChildBlur as onBlur to children', assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = shallow(<MultiSelect {...multiSelectProps} children={selectables} />);
	const renderedSelectables = wrapper.find('Selectable').getElements();

	for (const { props } of renderedSelectables) {
		assert.is(typeof props.onSelect, 'function');
		assert.is(typeof props.onBlur, 'function');
	}
});


test(`doesn't change state.focusedIndex when event.key is different from up/down arrow`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data));

	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);

	for (const key of ['1', 'a', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
		wrapper.simulate('keydown', { key });
		const element = wrapper.instance();
		assert.is(element.state.focusedIndex, null);
	}
});

test(`doesn't change state.focusedIndex when event.key is upArrow and state.focusedIndex === 0`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data))
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.setState({ focusedIndex: 0 });
	wrapper.simulate('keydown', { key: 'ArrowUp' });

	assert.is(wrapper.state().focusedIndex, 0);
});

test(`decremenets state.focusedIndex when event.key is up arrow and state.focusedIndex > 0`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data))
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.setState({ focusedIndex: 3 });
	wrapper.simulate('keydown', { key: 'ArrowUp' });

	assert.is(wrapper.state().focusedIndex, 2);
});

test(`does't change state.focusedIndex when event.key is down arrow and state.focusedIndex === props.children.length - 1`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data))
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	// wrapper.setState({ focusedIndex: selectableProps.length - 1 });
	const last = wrapper.find('Selectable').last();
	last.simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.is(wrapper.state().focusedIndex, selectableProps.length - 1);
});

test(`increments state.focusedIndex when event.key is down arrow and state.focusedIndex < props.children.length - 1`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data))
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	wrapper.find('Selectable').first().simulate('click');
	wrapper.simulate('keydown', { key: 'ArrowDown' });

	assert.is(wrapper.state().focusedIndex, 1);
});

test('changes state.focusedIndex to null when an list is blurred', assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data))
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const focused = wrapper.find('Selectable').first();
	focused.simulate('click');
	focused.simulate('blur');

	assert.is(wrapper.state().focusedIndex, null);
});

test(`doesn't change state.focusedIndex to null when an element inside the list is focused`, assert => {
	const selectableProps = getSelectableProps();
	const selection = new Set(selectableProps.filter(p => p.selected).map(p => p.data))
	const multiSelectProps = getMinMultiSelectProps(selection);

	const cmpKeys = ['selected', 'focused', 'data'];
	const selectables = selectableProps.map(props => <Selectable {...props}>This is for {props.data}</Selectable>);

	const wrapper = mount(<MultiSelect {...multiSelectProps} children={selectables} />);
	const focused = wrapper.find('Selectable').first();
	focused.simulate('click');
	focused.simulate('blur');

	wrapper.simulate('keydown', { key: 'ArrowDown' });
	assert.truthy(wrapper.state().focusedIndex);
});

test(`allows to plugin in custom classes`, assert => {
	const wrapper = mount(<MultiSelect className="penka" {...getMinMultiSelectProps()} />);
	const className = wrapper.getDOMNode().className;
	assert.is(className, 'multiselect penka');
});
