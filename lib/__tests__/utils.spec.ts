import test from 'ava';
import * as utils from '../utils';

const testCases = [
	[0, 10, 5, 5],
	[30, 40, 31, 31],
	[-20, 0, -15, -15],
	[-1000, -900, -990, -990],
	[-10, -5, -10, -10],
	[42, 69, 42, 42],
	[-69, -42, -69, -69],
	[200, 300, 300, 300],
	[-300, -200, -200, -200],
	[-50, 50, 0, 0],
	[-34, 37, 37, 37],
	[-3, 1010, -3, -3],
	[-5, 10, -20, -5],
	[-5, 10, -6, -5],
	[5, 20, 4, 5],
	[5, 20, -4, 5],
	[-20, 10, 11, 10],
	[2, 10, 101, 10]
];

test('ensureRange works', assert => {
	for(const [min, max, value, expectedValue] of testCases) {
		const result = utils.ensureRange(min, value, max);
		const failMessage = `Expected ${expectedValue} for ${[min, max, value]} but got ${result}`;
		assert.is(result, expectedValue, failMessage);
	}
});