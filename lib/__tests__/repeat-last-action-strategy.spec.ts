import './helpers/browser';
import * as fc from 'fast-check';
import { SelectionType } from '../handle-selection/types';
import { arbitrarySelectionContext, prop, areSetsEqual } from './helpers';
import * as repeatLastSelectionAction from '../handle-selection/repeat-last-action-strategy';

prop(
	'always matches for mouse when the only modifier is shift',
	arbitrarySelectionContext({
		data: fc.string(),
		maxE: 10,
		shiftKey: fc.constant(true),
		ctrlKey: fc.constant(false),
		altKey: fc.constant(false),
		selectionType: fc.constant('mouse' as SelectionType)
	}),
	ctx => repeatLastSelectionAction.matches[ctx.selectionType](ctx)
);

prop(
	'always matches for keyboard when the only modifier is shift and key is space',
	arbitrarySelectionContext({
		data: fc.integer(),
		maxE: 10,
		shiftKey: fc.constant(true),
		ctrlKey: fc.constant(false),
		altKey: fc.constant(false),
		selectionType: fc.constant('keyboard' as SelectionType),
		key: fc.constant(' ')
	}),
	ctx => repeatLastSelectionAction.matches[ctx.selectionType](ctx)
);

prop(
	'never match keyboard when key is not space',
	arbitrarySelectionContext({
		data: fc.char(),
		maxE: 10,
		shiftKey: fc.constant(true),
		selectionType: fc.constant('keyboard' as SelectionType),
		key: fc.char().filter(char => char !== ' ')
	}),
	ctx => !repeatLastSelectionAction.matches[ctx.selectionType](ctx)
);

prop(
	'never matches keyboard or mouse when shift is not pressed',
	arbitrarySelectionContext({
		data: fc.integer(),
		maxE: 10,
		shiftKey: fc.constant(false),
		key: fc.char()
	}),
	ctx => !repeatLastSelectionAction.matches[ctx.selectionType](ctx)
);

prop(
	`selection has old data + every data from the range [start, end] when selectionContext.data is not selected`,
	fc.tuple(
		fc.integer(-200, 200),
		fc.integer(-200, 200),
		fc.nat(150) // childrenData length
	)
		.chain(([a, b, minE]) => arbitrarySelectionContext({
				data: fc.integer(),
				minE: Math.max(a, b, minE + 1),
				maxE: Math.max(a, b, minE + 1) + 100
			})),
		ctx => {
			const { selection, childrenData, lastData, data } = ctx;
			selection.delete(data);
			const [start, end] = [lastData, data]
				.map(x => childrenData.indexOf(x))
				.sort((a, b) => a - b)
				.map(x => Math.max(0, Math.min(x, childrenData.length - 1)));
			const expectedSelection = new Set([
				...selection,
				...childrenData.slice(start, end + 1)
			]);
			const newSelection = repeatLastSelectionAction.getNewSelection(ctx);

			return areSetsEqual(expectedSelection, newSelection);
		}
);

prop(
	`returns set with old data minus every data from the range [start, end] when selectionContext.data is selected`,
	fc.tuple(
		fc.integer(-200, 200),
		fc.integer(-200, 200),
		fc.nat(150), // childrenData length
	)
		.chain(([a, b, minE]) => arbitrarySelectionContext({
			data: fc.integer(),
			minE: Math.max(a, b, minE + 1),
			maxE: Math.max(a, b, minE + 1) + 100
		})),
	ctx => {
		const { selection, childrenData, lastData, data } = ctx;
		selection.add(data);
		const [start, end] = [lastData, data]
			.map(x => childrenData.indexOf(x))
			.sort((a, b) => a - b)
			.map(x => Math.max(0, Math.min(x, childrenData.length - 1)));

		const range = childrenData.slice(start, end + 1);
		const expectedSelection = new Set(
			[...selection].filter(selectedData => !range.includes(selectedData))
		);
		const newSelection = repeatLastSelectionAction.getNewSelection(ctx);

		return areSetsEqual(expectedSelection, newSelection);
	}
);

prop(
	'stateUpdates.lastActionIndex is selectionContext.currentActionIndex',
	arbitrarySelectionContext({ data: fc.integer() }),
	ctx => repeatLastSelectionAction.getStateUpdates(ctx).lastData === ctx.data
);

prop(
	'never returns an update for anything besides lastData',
	arbitrarySelectionContext({ data: fc.integer() }),
	ctx => {
		const updates = repeatLastSelectionAction.getStateUpdates(ctx);
		return updates.hasOwnProperty('lastData') && Object.keys(updates).length === 1;
	}
);
