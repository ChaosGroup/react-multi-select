import './helpers/browser';
import test from 'ava';
import * as React from 'react';
import { spy } from 'sinon';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import { MouseEvent } from 'react';
import Selectable, { TSelectableProps } from '../Selectable';
import { noop } from './helpers';

enzyme.configure({ adapter: new Adapter() });
const { shallow } = enzyme;

const runTestsWithProps = (getMinProps, i) => {
	test(`${i}. renders without crashing with valid minimal props`, assert => {
		shallow(<Selectable {...getMinProps()} />);
		assert.pass();
	});

	{
		const minProps = getMinProps();
		if (minProps.render) {
			test(`${i}. renders element with tag from props.render`, assert => {
				const wrapper = shallow(<Selectable {...minProps} />);
				const element = wrapper.find(minProps.render).getElement();
				assert.is(element.type, minProps.render);
			});
		}
	}

	test(`${i}. renders renders children inside wrapper`, assert => {
		const minProps = getMinProps();
		const wrapper = shallow(<Selectable {...minProps} />);
		assert.deepEqual(wrapper.children().getElement(), minProps.children);
	});

	test(`${i}. _classname returns "multiselect__entry selected" when props.selected is true`, assert => {
		const minProps = { ...getMinProps(), selected: true };
		const instance = shallow(<Selectable {...minProps} />).instance() as Selectable<string>;

		assert.is(instance._className, 'multiselect__entry selected');
	});

	test(`${i}. _classname returns "multiselect__entry" when props.selected`, assert => {
		const wrapper = shallow(<Selectable {...getMinProps()} />);
		const instance = wrapper.instance() as Selectable<string>;

		assert.is(instance._className, 'multiselect__entry');
	});

	test(`${i}. _createOnSelect() returns a function when called with string`, assert => {
		const instance = shallow(<Selectable {...getMinProps()} />).instance() as Selectable<string>;
		// tslint:disable-next-line no-string-literal
		const onMouseSelect = (instance as any)._createOnSelect('mouse');
		assert.is(typeof onMouseSelect, 'function');

		// tslint:disable-next-line no-string-literal
		const onKeyboardSelect = instance['_createOnSelect']('keyboard');
		assert.is(typeof onKeyboardSelect, 'function');
	});

	test(`${i}. returned function passes event and selection info to props.onSelect`, assert => {
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

		// tslint:disable-next-line no-string-literal
		const onMouseSelect = (instance as any)._createOnSelect(selectionType);
		onMouseSelect(expectedEventObject as MouseEvent<HTMLElement>);

		onSelectSpy.restore();

		const [passedEvent, passedSelectionInfo] = onSelectSpy.getCall(0).args;

		assert.deepEqual(passedEvent, expectedEventObject);
		assert.deepEqual(passedSelectionInfo, expectedSelectionInfo);
	});
};

const propsProviders = [
	(): TSelectableProps<string> => ({
		selected: false,
		data: 'hello',
		onSelect: noop,
		index: 0,
		children: <h1>Hello</h1>
	}),
	(): TSelectableProps<string> => ({
		selected: false,
		data: 'hello',
		render: 'p',
		onSelect: noop,
		index: 0,
		children: <a href="https://www.haskell.org/hoogle/">haha</a>
	}),
	(): TSelectableProps<number> => ({
		selected: false,
		data: 3,
		render: 'a',
		onSelect: noop,
		index: 0,
		children: <pre>5</pre>
	}),
	(): TSelectableProps<object> => ({
		selected: false,
		data: {},
		render: 'div',
		onSelect: noop,
		index: 0,
		children: <p>Hello</p>
	})
];

propsProviders.forEach(runTestsWithProps);

test('clicking a disabled Selectable does not invoke props.onSelect', assert => {
	const [getMinProps] = propsProviders;
	const props = {
		...getMinProps(),
		disabled: true,
		onSelect: spy()
	};
	const wrapper = shallow(<Selectable {...props}>gosho</Selectable>);

	wrapper.simulate('click');
	assert.false(props.onSelect.called);
});

test('disabled Selectable has tabIndex of -1', assert => {
	const [getMinProps] = propsProviders;
	const props = {
		...getMinProps(),
		disabled: true
	};
	const wrapper = shallow(<Selectable {...props}>gosho</Selectable>);

	assert.is(-1, wrapper.getElement().props.tabIndex);
});

test('disabled Selectable has class disabled', assert => {
	const [getMinProps] = propsProviders;
	const props = {
		...getMinProps(),
		disabled: true
	};
	const instance = shallow(<Selectable {...props}>gosho</Selectable>).instance() as Selectable<string>;

	assert.true(instance._className.includes('disabled'));
});
