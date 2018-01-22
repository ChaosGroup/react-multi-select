import { expect } from 'chai';
import { testIsMatching, minSelectionContext, toMockSelectables } from './helpers';
import repeatLastSelectionAction from '../repeat-last-action-strategy';

describe('Repeat last action for range', () => {
	describe('matches', () => {
		describe('mouse()', () => {
			const selectionType = 'mouse';

			const shouldMatch = [
				{ ...minSelectionContext, selectionType, shiftKey: true }
			];
			const shouldNotMatch = [
				{ ...minSelectionContext, selectionType, ctrlKey: true, shiftKey: false },
				{ ...minSelectionContext, selectionType, ctrlKey: false, shiftKey: false }
			];
	
			testIsMatching(repeatLastSelectionAction, shouldMatch, shouldNotMatch);
		});

		describe('keyboard()', () => {
			const selectionType = 'keyboard';
			const key = ' ';

			const shouldMatch = [
				{ ...minSelectionContext, selectionType, key, shiftKey: true }
			];

			const shouldNotMatch = [
				{ ...minSelectionContext, selectionType, key, ctrlKey: true, shiftKey: false },
				{ ...minSelectionContext, selectionType, key, ctrlKey: false, shiftKey: false }
			];

			testIsMatching(repeatLastSelectionAction, shouldMatch, shouldNotMatch);
		});
	});

	describe('getNewSelection()', () => {
		it(`returns set containing old data + every data from the range [start, end] when last action was 'add'`, () => {
			const start = 1;
			const end = 5;
			const notInitiallySelected = [
				[6, {}, 'sdfsdfds'],
				[-42, { ilove: 'shipping console.log`s in production code' }, [1, 2, 3]]
			];
			const expectedSelection = [
				'roses are red',
				'violets are blue',
				...notInitiallySelected[0],
				'this test was hard to write',
				'so it should be hard to read too'
			];
			const initialSelection = [
				...expectedSelection.slice(0, 2),
				...expectedSelection.slice(-2)
			];
			const allChildrenData = [
				...expectedSelection,
				...notInitiallySelected[1]
			];

			const selectionContext = {
				...minSelectionContext,
				lastActionIndex: start,
				currentActionIndex: end,
				data: allChildrenData[end],
				lastAction: 'add',
				selection: new Set(initialSelection),
				children: toMockSelectables(allChildrenData)
			};
			const newSelection = repeatLastSelectionAction.getNewSelection(selectionContext);

			expect(newSelection.size).to.equal(expectedSelection.length);
			expect([...newSelection]).to.have.all.members(expectedSelection);
		});
		it(`returns set containing old data minus every data from the range [start, end] when last action was 'delete'`, () => {
			const start = 3;
			const end = 9;
			const expectedSelection = [
				'roses are red',
				'violets are blue',
				'i listen to gery-nikol',
				'and so should you',
				'// such poesy, much skill, such wow'
			];

			const initialSelection = [
				...expectedSelection.slice(0, start),
				...Array.from({ length: end - start }).map((_, i) => i),
				...expectedSelection.slice(start)
			];

			const allChildrenData = [
				...initialSelection.slice(0, 2 * start - end + 1),
				{},
				{},
				{},
				...initialSelection.slice(2 * start - end + 1)
			];

			const selectionContext = {
				...minSelectionContext,
				lastActionIndex: start,
				currentActionIndex: end,
				data: allChildrenData[end],
				lastAction: 'delete',
				selection: new Set(initialSelection),
				children: toMockSelectables(allChildrenData)
			};

			const newSelection = repeatLastSelectionAction.getNewSelection(selectionContext);
			expect(newSelection.size).to.equal(expectedSelection.length);
			expect([...newSelection]).to.have.all.members(expectedSelection);
		});
		it('behaves as called with currentActionIndex: 0 when currentActionIndex is negative');
		it('behaves as called with children.length - 1 when currentActionIndex is greater then children.length');
		it('behaves as called with lastActionIndex: 0 when lastActionIndex is negative');
		it('behaves as called with children.length - 1 when lastActionIndex is greater then children.length');
	});

	describe('getStateUpdates()', () => {
		const selectionContext = {
			...minSelectionContext,
			lastActionIndex: 0,
			currentActionIndex: 4,
			children: toMockSelectables([1, 2, 3, 4, 5, 6, 7, 8])
		};

		const { currentActionIndex } = selectionContext;
		it('sets lastActionIndex to currentActionIndex from passed context', () => {
			const { lastActionIndex } = repeatLastSelectionAction.getStateUpdates(selectionContext);
			expect(lastActionIndex).to.equal(currentActionIndex);
		});

		it(`doesn't return update for lastAction property when lastAction in selection context is 'delete'`, () => {
			const { lastAction } = repeatLastSelectionAction.getStateUpdates({ ...selectionContext, lastAction: 'delete' });
			expect(lastAction).to.be.undefined;
		});

		it(`doesn't return update lastAction property when lastAction in selection context is 'add'`, () => {
			const { lastAction } = repeatLastSelectionAction.getStateUpdates({ ...selectionContext, lastAction: 'add' });
			expect(lastAction).to.be.undefined;
		});
	});
});
