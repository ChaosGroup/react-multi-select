import { expect } from 'chai';
import { testIsMatching, minSelectionContext, toMockSelectables } from './helpers';
import toggleSelectedItem from '../toggle-item-selection-strategy';

describe('Toggle selected entry', () => {
	describe('matches', () => {
		describe('mouse()', () => {
			const selectionType = 'mouse';

			const shouldMatch = [
				{ ...minSelectionContext, selectionType, ctrlKey: true, shiftKey: false }
			];
			const shouldNotMatch = [
				{ ...minSelectionContext, selectionType, ctrlKey: true, shiftKey: true },
				{ ...minSelectionContext, selectionType, ctrlKey: false, shiftKey: true },
				{ ...minSelectionContext, selectionType, ctrlKey: false, shiftKey: false }
			];
	
			testIsMatching(toggleSelectedItem, shouldMatch, shouldNotMatch);
		});

		describe('keyboard()', () => {
			const selectionType = 'keyboard';
			const key = ' ';

			const shouldMatch = [
				{ ...minSelectionContext, selectionType, key, ctrlKey: true, shiftKey: false }
			];
			const shouldNotMatch = [
				{ ...minSelectionContext, selectionType, key, ctrlKey: true, shiftKey: true },
				{ ...minSelectionContext, selectionType, key, ctrlKey: false, shiftKey: true },
				{ ...minSelectionContext, selectionType, key, ctrlKey: false, shiftKey: false }
			];
	
			testIsMatching(toggleSelectedItem, shouldMatch, shouldNotMatch);
		});
	});

	describe('getNewSelection()', () => {
		it(`adds the passed data to the resulting Set if it wasn't present in the input Set`, () => {
			const initialSelection = [1, 5, 8, -5];
			const data = 42;
			const selectionContext = {
				...minSelectionContext,
				selection: new Set(initialSelection),
				data
			};

			const newSelection = toggleSelectedItem.getNewSelection(selectionContext);
			expect(newSelection.size).to.equal(initialSelection.length + 1);
			expect([...newSelection]).to.have.all.members([data, ...initialSelection]);
		});

		it('removes the passed data from the Set if it was present in the input Set', () => {
			const initialSelection = [1, 5, 8, -5];
			const data = initialSelection[0];
			const selectionContext = {
				...minSelectionContext,
				selection: new Set(initialSelection),
				data
			};

			const newSelection = toggleSelectedItem.getNewSelection(selectionContext);
			expect(newSelection.size).to.equal(initialSelection.length - 1);
			expect([...newSelection]).to.have.all.members(initialSelection.slice(1));
		});
	});

	describe('getStateUpdates()', () => {
		it('sets the lastActionIndex to the currentActionIndex from input context', () => {
			const currentActionIndex = 5;
			const children = toMockSelectables(Array.from({ length: currentActionIndex * 2 }).map((_, i) => i));
			const selectionContext = {
				...minSelectionContext,
				children,
				currentActionIndex
			};

			const { lastActionIndex } = toggleSelectedItem.getStateUpdates(selectionContext);
			expect(lastActionIndex).to.equal(currentActionIndex);
		});

		it(`sets the lastAction to 'add' when the data was't present in the input Set`, () => {
			const data = 5;
			const selection = new Set([1, 3, 8]);
			const selectionContext = {
				...minSelectionContext,
				selection,
				data
			};

			const { lastAction } = toggleSelectedItem.getStateUpdates(selectionContext);
			expect(lastAction).to.equal('add');
		});

		it(`sets the lastAction to 'delete' when the data was present in the input Set`, () => {
			const data = 5;
			const selection = new Set([1, 3, 5, 8]);
			const selectionContext = {
				...minSelectionContext,
				selection,
				data
			};

			const { lastAction } = toggleSelectedItem.getStateUpdates(selectionContext);
			expect(lastAction).to.equal('delete');
		});
	});
});
