import './helpers/browser';
import * as fc from 'fast-check';
import * as nassert from 'assert';

import * as React from 'react';

import { spy } from 'sinon';
import { shallow, mount } from 'enzyme';

import Selectable from '../Selectable';
import { SelectionType } from '../handle-selection/types';
import { noop, prop } from './helpers';

const arbitrarySelectableProps = () => fc.string(0, 10).chain(name => fc.record({
	selected: fc.boolean(),
	data: fc.constant(name),
	render: fc.constantFrom(...['li', 'a', 'div', 'span', 'abbr', 'strong', 'em'] as Array<keyof HTMLElementTagNameMap>),
	index: fc.nat(),
	onSelect: fc.constant(spy()),
	children: fc.constant([
		<h1 key="u no delete">{name}</h1>,
		...name.split('').map((char, i) => <span key={i}>{i}.{char}</span>)
	]),
	disabled: fc.option(fc.boolean())
}));

prop(
	'renders without crashing with valid props',
	arbitrarySelectableProps(),
	props => {
		shallow(<Selectable {...props} />);
		return true;
	}
);

prop(
	'renders html tag from render property',
	arbitrarySelectableProps(),
	props => {
		const wrapper = mount(<Selectable {...props} />);
		const element = wrapper.getDOMNode();
		return element.tagName.toLocaleLowerCase() === props.render;
	}
);

prop(
	'rendered children inside wrapper equal props.children',
	arbitrarySelectableProps(),
	props => {
		const wrapper = shallow(<Selectable {...props} />);
		nassert.deepEqual(
			wrapper.children().getElements(),
			props.children
		);
		return true;
	}
);

prop(
	'rendered element has multiselect__entry className',
	arbitrarySelectableProps(),
	props => shallow(<Selectable {...props} />)
		.getElement()
		.props.className.includes('multiselect__entry')
);

prop(
	'presence of .selected class is based on whether props.selected is true or not',
	arbitrarySelectableProps(),
	props => shallow(<Selectable {...props} />)
		.getElement()
		.props.className.includes('selected') === props.selected
);

prop(
	'onClick and onKeyDown pass event and selection info to props.onSelect',
	arbitrarySelectableProps().chain(props => fc.tuple(
		fc.constant({ ...props, disabled: false }),
		fc.constantFrom(
			['mouse' as SelectionType, 'click'],
			['keyboard' as SelectionType, 'keydown']
		)
	)),
	([props, [type, eventName]]) => {
		const wrapper = mount(<Selectable {...props} />);
		wrapper.simulate(eventName);
		const [eventArg, { data, selectionType }] = props.onSelect.getCall(0).args;
		return typeof eventArg === 'object'
			&& data === props.data
			&& selectionType === type
	}
);

prop(
	'onClick and onKeyDown always call event.stopPropagation',
	arbitrarySelectableProps().chain(props => fc.tuple(
		fc.constant(props),
		fc.constantFrom('click', 'keydown')
	)),
	([props, eventName]) => {
		const wrapper = mount(<Selectable {...props} />);
		const event = { stopPropagation: spy() };
		wrapper.simulate(eventName, event);
		return event.stopPropagation.calledOnce;
	}
);

prop(
	'click on a disabled Selectable never invokes props.onSelect',
	arbitrarySelectableProps().map(props => ({ ...props, disabled: true })),
	props => {
		const wrapper = shallow(<Selectable {...props} />);
		wrapper.simulate('click', { stopPropagation: noop });
		return !props.onSelect.called;
	}
);

prop(
	'disabled Selectable has tabIndex of -1',
	arbitrarySelectableProps().map(props => ({ ...props, disabled: true })),
	props => shallow(<Selectable {...props} />).props().tabIndex === -1
);

prop(
	'disabled Selectable has class disabled',
	arbitrarySelectableProps().map(props => ({ ...props, disabled: true })),
	props => shallow(<Selectable {...props} />)
		.getElement().props.className.includes('disabled')
);

prop(
	'custom className is attached',
	fc.tuple(fc.string(10, 15), arbitrarySelectableProps()),
	([className, props]) => shallow(<Selectable {...props} className={className} />)
		.getElement()
		.props.className.includes(className)
);

prop(
	'additional props pass through to rendered element',
	fc.tuple(
		fc.constant({
			onContextMenu: noop,
			onSomething: noop,
			title: 'test-test',
			id: 'kek'
		}),
		arbitrarySelectableProps()
	),
	([otherProps, props]) => {
		const wrapper = shallow(<Selectable {...otherProps} {...props} />);
		const elementProps = wrapper.getElement().props;
		return Object.entries(otherProps)
			.every(([key, value]) => value === elementProps[key]);
	}
);
