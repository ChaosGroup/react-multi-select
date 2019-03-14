import './helpers/browser';
import * as fc from 'fast-check';

import { prop, arbitrarySelectionContext, areSetsEqual } from './helpers';
import * as toggleSelectedItem from '../handle-selection/toggle-item-selection-strategy';

prop(
	'always matches mouse or keyboard when only modifier is control key',
	arbitrarySelectionContext({
		data: fc.string(),
		maxE: 150,
		ctrlKey: fc.constant(true),
		shiftKey: fc.constant(false),
		altKey: fc.constant(false)
	}).map(ctx => ({
		...ctx,
		key: ctx.selectionType === 'keyboard' ? ' ' : ctx.key
	})),
	ctx => toggleSelectedItem.matches[ctx.selectionType](ctx)
);

prop(
	'never matches when ctrl is not pressed',
	arbitrarySelectionContext({
		data: fc.integer(),
		maxE: 150,
		ctrlKey: fc.constant(false)
	}),
	ctx => !toggleSelectedItem.matches[ctx.selectionType](ctx)
);

prop(
	'never matches when shift or alt are pressed',
	arbitrarySelectionContext({
		data: fc.integer(),
		maxE: 150
	}).filter(ctx => ctx.shiftKey || ctx.altKey),
	ctx => !toggleSelectedItem.matches[ctx.selectionType](ctx)
);

prop(
	'new selection contains the data item if it was not present in the selection',
	arbitrarySelectionContext({ data: fc.integer() })
		.map(ctx => {
			const selection = new Set(ctx.selection);
			selection.delete(ctx.data);
			return { ...ctx, selection };
		}),
	ctx => {
		const expectedSelection = new Set([...ctx.selection, ctx.data]);
		const newSelection = toggleSelectedItem.getNewSelection(ctx);
		return areSetsEqual(expectedSelection, newSelection);
	}
);

prop(
	'new selection does not contain the data item if it is present in the selection',
	arbitrarySelectionContext({ data: fc.integer() })
		.map(ctx => ({ ...ctx, selection: new Set([...ctx.selection, ctx.data]) })),
	ctx => {
		const expectedSelection = new Set([...ctx.selection].filter(data => data !== ctx.data));
		const newSelection = toggleSelectedItem.getNewSelection(ctx);
		return areSetsEqual(expectedSelection, newSelection);
	}
);

prop(
	'sets the lastData to the current data from input context',
	arbitrarySelectionContext({ data: fc.integer() }),
	ctx => toggleSelectedItem.getStateUpdates(ctx).lastData === ctx.data
);

prop(
	'stateUpdates.lastAction is always delete if the previous selection contains the data',
	arbitrarySelectionContext({ data: fc.char() })
		.map(ctx => ({ ...ctx, selection: new Set([...ctx.selection, ctx.data]) })),
	ctx => toggleSelectedItem.getStateUpdates(ctx).lastAction === 'delete'
);

prop(
	'stateUpdates.lastAction is always add if the previous selection does not contain the data',
	arbitrarySelectionContext({ data: fc.char() })
		.map(ctx => {
			const selection = new Set(ctx.selection);
			selection.delete(ctx.data);
			return { ...ctx, selection };
		}),
	ctx => toggleSelectedItem.getStateUpdates(ctx).lastAction === 'add'
);
