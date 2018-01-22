import { expect } from 'chai';
import { testIsMatching, minSelectionContext, toMockSelectables } from './helpers';
import selectAll from '../select-all-strategy';

describe('Selection strategy: select all', () => {
	describe('matches', () => {
		describe('keyboard()', () => {
			const shouldMatch = [
				{
					...minSelectionContext,
					selectionType: 'keyboard',
					ctrlKey: true,
					key: 'a'
				}
			];

			const shouldNotMatch = [
				{
					...minSelectionContext,
					selectionType: 'keyboard',
					ctrlKey: true,
					key: 'b'
				},
				{
					...minSelectionContext,
					selectionType: 'keyboard',
					ctrlKey: false,
					key: 'a'
				}
			];

			testIsMatching(selectAll, shouldMatch, shouldNotMatch);
		});

		it(`doesn't have "mouse" property`, () => {
			expect(selectAll.matches.mouse).to.be.undefined;
		});
	});

	describe('getNewSelection()', () => {
		it('returns a Set containing the same data when selected children is an empty array', () => {
			const selectionContext = {
				...minSelectionContext,
				children: []
			};

			const expectedSelection = selectionContext.selection;
			const newSelection = selectAll.getNewSelection(selectionContext);

			expect(newSelection.size).to.equal(expectedSelection.size);
			expect([...newSelection]).to.have.all.members([...expectedSelection]);
		});

		it('returns a new Set containing the data from the set and the data from the children', () => {
			const initiallySelected = [1, 5, 'beep boop'];
			const childrenData = toMockSelectables([7, 5, 'beep']);
			const selectionContext = {
				...minSelectionContext,
				selection: new Set(initiallySelected),
				children: childrenData.map(data => ({ props: { data } }))
			};

			const expectedSelection = new Set([...initiallySelected, ...childrenData]);
			const newSelection = selectAll.getNewSelection(selectionContext);
			expect([...newSelection]).to.have.all.members([...expectedSelection]);
		});

		it('returns empty Set for empty children array and empty prior selection', () => {
			const selectionContext = {
				...minSelectionContext,
				selection: new Set,
				children: []
			};

			const newSelection = selectAll.getNewSelection(selectionContext);

			expect(newSelection.size).to.equal(0);
		});
	});

	describe('getStateUpdates()', () => {
		it('returns null', () => {
			expect(selectAll.getStateUpdates(minSelectionContext)).to.be.null;
		});
	});
});
