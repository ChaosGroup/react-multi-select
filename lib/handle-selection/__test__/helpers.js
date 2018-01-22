import { expect } from 'chai';
import { pick } from 'lodash';

const pickSelectors = selectionContext => JSON.stringify(pick(selectionContext, ['ctrlKey', 'shiftKey', 'altKey', 'key', 'selectionType']));

export const toMockSelectables = dataItems => dataItems.map(data => ({ props: { data } }));

export function testIsMatching(strategy, shouldMatch, shouldNotMatch) {
	for (const selectionContext of shouldMatch) {
		const { selectionType } = selectionContext;
		it(`matches for ${pickSelectors(selectionContext)}`, () => {
			expect(strategy.matches[selectionType](selectionContext)).to.be.true;
		});
	}

	for (const selectionContext of shouldNotMatch) {
		const { selectionType } = selectionContext;
		it(`doesn't match for ${pickSelectors(selectionContext)}`, () => {
			expect(strategy.matches[selectionType](selectionContext)).to.be.false;
		});
	}
}

export const minSelectionContext = Object.freeze({
	selection: new Set([1, 5, 10, 42]),
	data: 8,
	lastAction: 'add',
	lastActionIndex: 2,
	currentActionIndex: 5,
	children: toMockSelectables([1, 2, 5, 6, 10, 7, 42]),
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	selectionType: 'mouse'
});
