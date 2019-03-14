import test from 'ava';
import * as enzyme from 'enzyme';
import * as fc from 'fast-check';

import {
	SelectionAction,
	SelectionType,
	TSelectionContext
} from '../../handle-selection/types';

export const prop = <T>(
	description: string,
	arbitrary: fc.Arbitrary<T>,
	predicate: (input: T) => boolean
) => test(
	description,
	assert => {
		fc.assert(fc.property(arbitrary, predicate));
		assert.pass();
	}
);

export type SelectionContextArbitrary<T> = {
	data: fc.Arbitrary<T>;
	minE?: number;
	maxE?: number;
	selection?: fc.Arbitrary<Set<T>>;
	selectionType?: fc.Arbitrary<SelectionType>;
	lastAction?: fc.Arbitrary<SelectionAction>;
	lastData?: fc.Arbitrary<T>;
	key?: fc.Arbitrary<string>;
	shiftKey?: fc.Arbitrary<boolean>;
	altKey?: fc.Arbitrary<boolean>;
	ctrlKey?: fc.Arbitrary<boolean>;
};

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97));

export const arbitrarySelectionContext = <T>(options: SelectionContextArbitrary<T>) => {
	const {
		data,
		minE = 1,
		maxE = 1000,
		selection,
		selectionType = fc.constantFrom('mouse' as SelectionType, 'keyboard' as SelectionType),
		lastAction = fc.constantFrom('add' as SelectionAction, 'remove' as SelectionAction),
		lastData,
		shiftKey = fc.boolean(),
		altKey = fc.boolean(),
		ctrlKey = fc.boolean(),
		key = fc.constantFrom(...ALPHABET)
	} = options;

	return fc.array(data, minE, maxE)
		.chain(childrenData => fc.tuple(fc.constant(childrenData), fc.shuffledSubarray(childrenData)))
		.chain(([dataArray, dataSelection]) => fc.record({
			selection: selection || fc.constant(new Set(dataSelection)),
			data: fc.constantFrom(...dataArray),
			lastAction,
			lastData: lastData || fc.oneof(
				fc.constant(null),
				fc.constantFrom(...dataArray)
			),
			childrenData: fc.constant(dataArray),
			selectionType,
			altKey,
			ctrlKey,
			shiftKey,
			key
		}));
};

export const noop = (): void => undefined;

export const json = JSON.stringify;

export const simulateFocus = (
	wrapper: enzyme.ReactWrapper<any, any>,
	selectableWrapper: enzyme.ReactWrapper<any, any>
) => {
	(selectableWrapper.getDOMNode() as HTMLElement).focus();
	wrapper.simulate('click');
};

export const repeat = (n: number, action: (i: number) => any): void => Array.from({ length: n }).forEach(action);

export const areSetsEqual = <T>(s1: Set<T>, s2: Set<T>): boolean => {
	if (s1.size !== s2.size) {
		return false;
	}

	for (const v1 of s1) {
		if (!s2.has(v1)) {
			return false;
		}
	}

	return true;
};
