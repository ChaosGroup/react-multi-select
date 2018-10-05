import './helpers/browser';
import test from 'ava';
import * as React from 'react';
import { mount } from 'enzyme';
import { areSetsEqual, json } from './helpers';

import MultiSelect, { Selectable, STRATEGY_NAME } from '../index';
import { TSelectionStrategy } from '../handle-selection/index';

const subcharStart: TSelectionStrategy<number> = {
	getNewSelection: ({ selection, childrenData, key }) => new Set(
		childrenData.filter(n => String(n).startsWith(key))
	),
	getStateUpdates: ctx => ({ $lastKey: ctx.key }),
	matches: {
		keyboard: ({ ctrlKey, key }) => ctrlKey && String(Number(key)) === key
	}
};

type NumberListProps = {
	numbers: number[];
	selection: Set<number>;
	onSelectionChange: (newSelection: Set<number>) => any;
	strategies?: Array<TSelectionStrategy<number> | STRATEGY_NAME>;
};

const NumberList = (props: NumberListProps) => (
	<MultiSelect
		render="div"
		selection={props.selection}
		onSelectionChange={props.onSelectionChange}
		strategies={props.strategies || [subcharStart]}
	>
		{props.numbers.map(n => <Selectable key={n} data={n} render="span">{n}</Selectable>)}
	</MultiSelect>
);

const customStrategyTestCases = [
	{
		numbers: [1, 2, 3, 22, 23, 21, 10, 32, 38],
		selection: [],
		expectedSelection: [2, 22, 23, 21],
		key: '2'
	},
	{
		numbers: [99, 100, 101, 102, 500, 1],
		selection: [99, 500, 1],
		expectedSelection: [100, 101, 102, 1],
		key: '1'
	},
	{
		numbers: [1, 2, 3],
		selection: [1, 2, 3],
		expectedSelection: [],
		key: '6'
	},
	{
		numbers: [5, 55, 555, 66],
		selection: [5, 55, 555],
		expectedSelection: [5, 55, 555],
		key: '5'
	}
];

for (const { numbers, selection, key, expectedSelection } of customStrategyTestCases ) {
	let result;
	const onSelectionChange = newSelection => result = newSelection;
	const wrapper = mount(
		<NumberList
			numbers={numbers}
			selection={new Set(selection)}
			onSelectionChange={onSelectionChange}
		/>
	);
	wrapper.find(Selectable).first().simulate('keydown', { ctrlKey: true, key });

	test(`ctrl + ${key} with data of ${json(numbers)} propagates ${json(expectedSelection)}`, assert => {
		assert.true(areSetsEqual(result, new Set(expectedSelection)));
	});

	test(`persists custom state of ${JSON.stringify({ $lastKey: key })}`, assert => {
		assert.is(
			wrapper.find(MultiSelect).first().instance().state.$lastKey,
			key
		);
	});
}

const mixedStrategiesCases = [
	{
		numbers: [1, 2, 3],
		selection: [],
		strategies: [STRATEGY_NAME.SELECT_SINGLE, subcharStart],
		inputs: [
			{
				expectedSelection: [1],
				args: ['click', {}]
			},
			{
				expectedSelection: [3],
				args: ['keydown', { ctrlKey: true, key: '3' }]
			}
		]
	},
	{
		numbers: [11, 22, 33, 1, 2, 3],
		selection: [1, 2, 3],
		strategies: [STRATEGY_NAME.TOGGLE_SINGLE, STRATEGY_NAME.SELECT_ALL],
		inputs: [
			{
				expectedSelection: [11, 1, 2, 3],
				args: ['click', { ctrlKey: true }]
			},
			{
				expectedSelection: [11, 22, 33, 1, 2, 3],
				args: ['keydown', { ctrlKey: true, key: 'a' }]
			}
		]
	}
];

for (const { numbers, selection, strategies, inputs } of mixedStrategiesCases) {
	for (const { args, expectedSelection } of inputs) {
		test(
			`propagates selection ${json(expectedSelection)} for input ${json(args)}`,
			assert => {
				let result;
				const spy = newSelection => result = newSelection;
				const wrapper = mount(
					<NumberList
						numbers={numbers}
						selection={new Set(selection)}
						onSelectionChange={spy}
						strategies={strategies}
					/>
				);

				const [action, opts] = args;
				wrapper.find(Selectable).first().simulate(action as string, opts);

				assert.true(areSetsEqual(result, new Set(expectedSelection)));
			}
		);
	}
}
