import test from 'ava';
import * as React from 'react';
import { spy } from 'sinon';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import Selectable, { TSelectableProps } from '../Selectable';
import { MouseEvent } from 'react';

enzyme.configure({ adapter: new Adapter() });
const { shallow } = enzyme;

const getMinProps = (): TSelectableProps<string> => ({
	selected: false,
	focused: false,
	data: 'hello',
	onSelect: () => { },
	onBlur: () => { },
	index: 0,
	children: <h1>Hello</h1>
});

test('Selectable#render renders without crashing with valid minimal props', assert => {
	shallow(<Selectable {...getMinProps() } />);
});

test('Selectable#render renders renders children inside wrapper', assert => {
	const minProps = getMinProps();
	const wrapper = shallow(<Selectable {...minProps} />);
	assert.deepEqual(wrapper.children().getElement(), minProps.children);
});

test(`Selectable#_classname returns "multiselect__entry selected" when props.selected is true`, assert => {
	const minProps: TSelectableProps<string> = { ...getMinProps(), selected: true };
	const instance = shallow(<Selectable {...minProps} />).instance() as Selectable<string>;

	assert.is(instance._className, 'multiselect__entry--selected');
});

test(`Selectable#_classname returns "multiselect__entry" when props.selected`, assert => {
	const wrapper = shallow(<Selectable {...getMinProps() } />);
	const instance = wrapper.instance() as Selectable<string>;

	assert.is(instance._className, 'multiselect__entry');
});

test('Selectable#_refProps returns object with props ref of type function when props.focused is true', assert => {
	const minProps = { ...getMinProps(), focused: true };
	const instance = shallow(<Selectable {...minProps} />).instance() as Selectable<string>;
	const { ref } = instance._refProps;

	assert.is(typeof ref, 'function');
});

test('returns object without props when props.focused is false', assert => {
	const minProps = { ...getMinProps(), focused: false };
	const instance = shallow(<Selectable {...minProps} />).instance() as Selectable<string>;
	const { ref } = instance._refProps;

	assert.is(ref, undefined);
});

test('Selectable#_createOnSelect() returns a function when called with string', assert => {
	const instance = shallow(<Selectable {...getMinProps() } />).instance() as Selectable<string>;
	const onMouseSelect = instance._createOnSelect('mouse');
	assert.is(typeof onMouseSelect, 'function');

	const onKeyboardSelect = instance._createOnSelect('keyboard');
	assert.is(typeof onKeyboardSelect, 'function');
});

test('returned function passes event and selection info to props.onSelect', assert => {
	const data = 333;
	const selectionType = 'mouse';
	const index = 5;

	const expectedSelectionInfo = {
		data,
		selectionType,
		currentActionIndex: index
	};

	const expectedEventObject = {};

	const minProps = { ...getMinProps(), data, index };
	const onSelectSpy = spy(minProps, 'onSelect');
	const instance = shallow(<Selectable {...minProps} />).instance() as Selectable<string>;

	const onMouseSelect = instance._createOnSelect(selectionType);
	onMouseSelect(expectedEventObject as MouseEvent<HTMLLIElement>);

	onSelectSpy.restore();

	const [passedEvent, passedSelectionInfo] = onSelectSpy.getCall(0).args;

	assert.deepEqual(passedEvent, expectedEventObject);
	assert.deepEqual(passedSelectionInfo, expectedSelectionInfo);
});

test('Selectable#_onBlur() calls props.onBlur with index from props', assert => {
	const minProps = { ...getMinProps(), selected: true, focused: true, index: 2 };
	const onBlurSpy = spy(minProps, 'onBlur');
	const instance = shallow(<Selectable {...minProps} />).instance() as Selectable<string>;

	instance._onBlur();
	onBlurSpy.restore();

	assert.true(onBlurSpy.calledWith(minProps.index));
});
