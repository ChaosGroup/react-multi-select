import './helpers/browser';
import * as fc from 'fast-check';

import { prop, arbitrarySelectionContext } from './helpers';
import * as selectNewEntry from '../handle-selection/select-new-entry-strategy';

prop(
	'always matches mouse or keyboard with no ctrl or shift',
	arbitrarySelectionContext({
		data: fc.integer(),
		ctrlKey: fc.constant(false),
		shiftKey: fc.constant(false)
	}),
	ctx => selectNewEntry.matches.mouse(ctx)
);

prop(
	'never matches when control or shift are pressed',
	arbitrarySelectionContext({ data: fc.char() })
		.filter(ctx => ctx.ctrlKey || ctx.shiftKey),
	ctx => !selectNewEntry.matches.mouse(ctx)
);

prop(
	'always returns a set with only the data element',
	fc.nat(100).chain(diceroll => {
		const overrides = diceroll > 75 ? { selection: fc.constant(new Set) } : {};
		return arbitrarySelectionContext({ data: fc.integer(), ...overrides });
	}),
	ctx => selectNewEntry.getNewSelection(ctx).size === 1
);

prop(
	'stateUpdates.lastActionIndex is selectionContext.currentActionIndex',
	arbitrarySelectionContext({ data: fc.integer() }),
	ctx => selectNewEntry.getStateUpdates(ctx).lastActionIndex === ctx.currentActionIndex
);

prop(
	`stateUpdates.lastAction is set to 'add'`,
	arbitrarySelectionContext({ data: fc.char() }),
	ctx => selectNewEntry.getStateUpdates(ctx).lastAction === 'add'
);
