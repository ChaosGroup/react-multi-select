import { expect } from 'chai';
import { testIsMatching, minSelectionContext } from './helpers';
import selectNewEntry from '../select-new-entry-strategy';

describe('Selection strategy: select new entry', () => {
	describe('matches', () => {
		describe('mouse()', () => {
			const shouldMatch = [
				{ ...minSelectionContext, selectionType: 'mouse', ctrlKey: false, shiftKey: false }
			];
			const shouldNotMatch = [
				{ ...minSelectionContext, selectionType: 'mouse', ctrlKey: false, shiftKey: true },
				{ ...minSelectionContext, selectionType: 'mouse', ctrlKey: true, shiftKey: false },
				{ ...minSelectionContext, selectionType: 'mouse', ctrlKey: true, shiftKey: true }
			];

			testIsMatching(selectNewEntry, shouldMatch, shouldNotMatch);
		});

		describe('keyboard()', () => {
			const shouldMatch = [
				{ ...minSelectionContext, selectionType: 'keyboard', ctrlKey: false, shiftKey: false, key: ' ' }
			];
			const shouldNotMatch = [
				{ ...minSelectionContext, selectionType: 'keyboard', ctrlKey: false, shiftKey: true },
				{ ...minSelectionContext, selectionType: 'keyboard', ctrlKey: true, shiftKey: false },
				{ ...minSelectionContext, selectionType: 'keyboard', ctrlKey: true, shiftKey: true }
			];

			testIsMatching(selectNewEntry, shouldMatch, shouldNotMatch);
		});
	});

	describe('getNewSelection()', () => {
		it('returns a new Set containing only the data that has been passed in', () => {
			const newSelectionData = 42;

			const selectionContext = {
				...minSelectionContext,
				data: newSelectionData,
				selection: new Set([1, 2, 3, 50, 60])
			};

			const newSelection = selectNewEntry.getNewSelection(selectionContext);

			expect(newSelection.size).to.equal(1);
			expect(newSelection.has(newSelectionData)).to.be.true;
		});

		it('returns a new Set with only the data element when current selection is empty', () => {
			const newSelectionData = 33;

			const selectionContext = {
				...minSelectionContext,
				data: newSelectionData,
				selection: new Set
			};

			const newSelection = selectNewEntry.getNewSelection(selectionContext);

			expect(newSelection.size).to.equal(1);
			expect(newSelection.has(newSelectionData)).to.be.true;
		});
	});

	describe('getStateUpdates()', () => {
		const selectionContext = { ...minSelectionContext, currentActionIndex: 3 };

		it(`sets lastActionIndex to currentActionIndex from passed context`, () => {
			const { lastActionIndex } = selectNewEntry.getStateUpdates(selectionContext);

			expect(lastActionIndex).to.equal(selectionContext.currentActionIndex);
		});

		it(`sets lastAction to 'add'`, () => {
			const { lastAction } = selectNewEntry.getStateUpdates(selectionContext);

			expect(lastAction).to.equal('add');
		});
	});
});
