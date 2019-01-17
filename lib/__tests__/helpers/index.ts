import test from 'ava';
import * as enzyme from 'enzyme';
import {
	SelectionAction,
	SelectionType,
	TSelectionStrategy,
	TSelectionContext
} from '../../handle-selection/types';
import * as fc from 'fast-check';

const pickSelectors = (selectionContext: { [id: string]: any }) => JSON.stringify(
	[
		'ctrlKey',
		'shiftKey',
		'altKey',
		'key',
		'selectionType'
	].reduce((obj: object, key: string) => ({ ...obj, [key]: selectionContext[key] }), selectionContext)
);

export const prop = <T>(description: string, arbitrary: fc.Arbitrary<T>, predicate: (input: T) => boolean) => test(
	description,
	assert => {
		fc.assert(fc.property(arbitrary, predicate));
		assert.pass();
	}
);

export type Opts<T> = {
	data: fc.Arbitrary<T>;
	minE?: number;
	maxE?: number;
	selection?: fc.Arbitrary<Set<T>>;
	selectionType?: fc.Arbitrary<SelectionType>;
	lastAction?: fc.Arbitrary<SelectionAction>;
	lastActionIndex?: fc.Arbitrary<number>;
	currentActionIndex?: fc.Arbitrary<number>;
	key?: fc.Arbitrary<string>;
	shiftKey?: fc.Arbitrary<boolean>;
	altKey?: fc.Arbitrary<boolean>;
	ctrlKey?: fc.Arbitrary<boolean>;
};

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97));

export const arbitrarySelectionContext = <T>(options: Opts<T>) => {
	const {
		data,
		minE = 1,
		maxE = 1000,
		selection,
		selectionType = fc.constantFrom('mouse' as SelectionType, 'keyboard' as SelectionType),
		lastAction = fc.constantFrom('add' as SelectionAction, 'remove' as SelectionAction),
		lastActionIndex,
		currentActionIndex,
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
			lastActionIndex: lastActionIndex || fc.integer(0, dataArray.length),
			currentActionIndex: currentActionIndex || fc.integer(0, dataArray.length),
			childrenData: fc.constant(dataArray),
			selectionType,
			altKey,
			ctrlKey,
			shiftKey,
			key
		}));
};

export const testIsMatching = <DT>(
	strategy: TSelectionStrategy<DT>,
	shouldMatch: Iterable<TSelectionContext<DT>>,
	shouldNotMatch: Iterable<TSelectionContext<DT>>,
	name: string
) => {
	for (const selectionContext of shouldMatch) {
		const { selectionType } = selectionContext;
		test(`${name} matches for ${pickSelectors(selectionContext)}`, assert => {
			assert.true(strategy.matches[selectionType](selectionContext));
		});
	}

	for (const selectionContext of shouldNotMatch) {
		const { selectionType } = selectionContext;
		test(`${name} doesn't match for ${pickSelectors(selectionContext)}`, assert => {
			assert.false(strategy.matches[selectionType](selectionContext));
		});
	}
};

export const minSelectionContext = Object.freeze({
	selection: new Set([1, 5, 10, 42]),
	data: 8,
	lastAction: ('add' as SelectionAction),
	lastActionIndex: 2,
	currentActionIndex: 5,
	childrenData: [1, 2, 5, 6, 10, 7, 42],
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	selectionType: ('mouse' as SelectionType)
});

export const selectionCtx = <DT>(overrides: object): TSelectionContext<DT> => {
	return ({ ...minSelectionContext, ...overrides } as any /* GJ typescript */ as TSelectionContext<DT>);
};

export const noop = () => undefined;

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
