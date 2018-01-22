import { expect } from 'chai';
import repeatLastSelectionAction from '../handle-selection';

describe('handleSelection()', () => {
	it('default export is function', () => {
		expect(repeatLastSelectionAction).to.be.a('function');
	});
});
