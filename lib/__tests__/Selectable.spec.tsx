import './helpers/browser';
import test from 'ava';
import * as React from 'react';
import { spy } from 'sinon';
import { shallow } from 'enzyme';

import { MouseEvent } from 'react';
import Selectable, { TSelectableProps } from '../Selectable';
import { noop } from './helpers';

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
		const onMouseSelect = (instance as any)._onMouseSelect;
		onMouseSelect(expectedEventObject as MouseEvent<HTMLElement>);

		onSelectSpy.restore();

		const [passedEvent, passedSelectionInfo] = onSelectSpy.getCall(0).args;

		assert.deepEqual(passedEvent, expectedEventObject);
		assert.deepEqual(passedSelectionInfo, expectedSelectionInfo);
	});
};

const propsProviders = [
	(): TSelectableProps<any> => ({
		selected: false,
		data: 'hello',
		onSelect: noop,
		index: 0,
		children: <h1>Hello</h1>
	}),
	(): TSelectableProps<any> => ({
		selected: false,
		data: 'hello',
		render: 'p',
		onSelect: noop,
		index: 0,
		children: <a href="https://www.haskell.org/hoogle/">haha</a>
	}),
	(): TSelectableProps<any> => ({
		selected: false,
		data: 3,
		render: 'a',
		onSelect: noop,
		index: 0,
		children: <pre>5</pre>
	}),
	(): TSelectableProps<any> => ({
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

test('custom className is attached', assert => {
	const [getMinProps] = propsProviders;
	const props = {
		...getMinProps(),
		className: 'test1'
	};
	const wrapper = shallow(<Selectable {...props}>gosho</Selectable>);

	assert.true(wrapper.props().className.includes(props.className));
});

test('additional props pass through to rendered element', assert => {
	const [getMinProps] = propsProviders;
	const props = {
		...getMinProps(),
		title: 'testtest2',
		['data-something']: 5
	};
	const wrapper = shallow(<Selectable {...props}>gosho</Selectable>);

	assert.is(wrapper.props().title, props.title);
	assert.is(wrapper.props()['data-something'], props['data-something']);
});
