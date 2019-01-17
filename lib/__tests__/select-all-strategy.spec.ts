import './helpers/browser';
import test from 'ava';
import * as fc from 'fast-check';

import { SelectionAction, SelectionType } from '../handle-selection/types';
import * as selectAll from '../handle-selection/select-all-strategy';

const arbitrarySelectionContext = <T>(arbitrary: fc.Arbitrary<T>, minE: number = 1, maxE: number = 1000) =>
	fc.array(arbitrary, minE, maxE)
		.chain(childrenData => fc.tuple(fc.constant(childrenData), fc.shuffledSubarray(childrenData)))
		.chain(([data, selection]) => fc.record({
			selection: fc.constant(new Set(selection)),
			data: fc.constantFrom(...data),
			lastAction: fc.constantFrom('add' as SelectionAction, 'remove' as SelectionAction),
			lastActionIndex: fc.integer(0, data.length),
			currentActionIndex: fc.integer(0, data.length),
			childrenData: fc.constant(data),
			selectionType: fc.constant('keyboard' as SelectionType),
			altKey: fc.boolean(),
			ctrlKey: fc.boolean(),
			shiftKey: fc.boolean(),
			key: fc.constantFrom(
				...Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97))
			)
		}));
{
	test('matches ctrl+a and nothing else', assert => {
		fc.assert(
			fc.property(
				arbitrarySelectionContext(fc.integer()),
				ctx => selectAll.matches.keyboard(ctx) === (ctx.ctrlKey && ctx.key === 'a')
			)
		);
		assert.pass();
	});
}

test(`doesn't have "mouse" property`, assert => {
	assert.false('mouse' in selectAll.matches);
});

test('getNewSelection returns all elements of childrenData in a Set', assert => {
	const selectionContextArb = arbitrarySelectionContext(fc.string());

	fc.assert(
		fc.property(
			selectionContextArb,
			ctx => {
				const newSelection = selectAll.getNewSelection(ctx);
				const expectedSelection = new Set(ctx.childrenData);
				if (newSelection.size !== expectedSelection.size) {
					return false;
				}

				for (const v of newSelection) {
					if (!expectedSelection.has(v)) {
						return false;
					}
				}

				return true;
			}
		)
	);
	assert.pass();
});

test('getStateUpdates always returns null updates', assert => {
	fc.assert(
		fc.property(
			arbitrarySelectionContext(fc.integer()),
			ctx => selectAll.getStateUpdates(ctx) === null
		)
	);
	assert.pass();
});
