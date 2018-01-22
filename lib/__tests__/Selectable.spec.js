import React from 'react';
import { expect } from 'chai';
import { spy } from 'sinon';
import { shallow } from 'enzyme';

import Selectable from '../Selectable';

const getMinProps = () => ({
	selected: false,
	focused: false,
	data: 'hello',
	onSelect: () => { },
	onBlur: () => { },
	index: 0,
	children: <h1>Hello</h1>
});

describe('Selectable.react', () => {
	describe('render()', () => {
		it('renders without crashing with valid minimal props', () => {
			shallow(<Selectable {...getMinProps()} />);
		});

		it('renders renders children inside wrapper', () => {
			const minProps = getMinProps();
			const wrapper = shallow(<Selectable {...minProps} />);
			expect(wrapper.children().getNode()).to.equal(minProps.children);
		});
	});

	describe('get _className()', () => {
		it(`returns "multiselect__entry selected" when props.selected is true`, () => {
			const minProps = { ...getMinProps(), selected: true };
			const wrapper = shallow(<Selectable {...minProps} />);
			const className = wrapper.instance()._className;

			expect(className).to.equal('multiselect__entry selected');
		});

		it(`returns "multiselect__entry" when props.selected`, () => {
			const wrapper = shallow(<Selectable {...getMinProps()} />);
			const className = wrapper.instance()._className;

			expect(className).to.equal('multiselect__entry');
		});
	});

	describe('get _refProps()', () => {
		it('returns object with props ref of type function when props.focused is true', () => {
			const minProps = { ...getMinProps(), focused: true };
			const wrapper = shallow(<Selectable {...minProps} />);
			const { ref } = wrapper.instance()._refProps;

			expect(ref).to.be.a('function');
		});

		it('returns object without props when props.focused is false', () => {
			const minProps = { ...getMinProps(), focused: false };
			const wrapper = shallow(<Selectable {...minProps} />);
			const { ref } = wrapper.instance()._refProps;

			expect(ref).to.be.undefined;
		});
	});

	describe('_createOnSelect()', () => {
		it('returns a function when called with string', () => {
			const wrapper = shallow(<Selectable {...getMinProps()} />);
			const onMouseSelect = wrapper.instance()._createOnSelect('mouse');
			expect(onMouseSelect).to.be.a('function');

			const onKeyboardSelect = wrapper.instance()._createOnSelect('keyboard');
			expect(onKeyboardSelect).to.be.a('function');			
		});

		it('returned function passes event and selection info to props.onSelect', () => {
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
			const wrapper = shallow(<Selectable {...minProps} />);
			
			const onMouseSelect = wrapper.instance()._createOnSelect(selectionType);
			onMouseSelect(expectedEventObject);

			onSelectSpy.restore();

			const [passedEvent, passedSelectionInfo] = onSelectSpy.getCall(0).args;

			expect(passedEvent).to.deep.equal(expectedEventObject);
			expect(passedSelectionInfo).to.deep.equal(expectedSelectionInfo);
		});
	});

	describe('_onBlur()', () => {
		it('calls props.onBlur with index from props', () => {
			const minProps = { ...getMinProps(), selected: true, focused: true, index: 2 };
			const onBlurSpy = spy(minProps, 'onBlur');
			const wrapper = shallow(<Selectable {...minProps} />);

			wrapper.instance()._onBlur();
			onBlurSpy.restore();

			expect(onBlurSpy.calledWith(minProps.index)).to.be.true;
		});
	});
});
