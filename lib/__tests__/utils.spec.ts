import './helpers/browser';
import test from 'ava';
import * as utils from '../utils';
import { OSName } from '../constants';

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
	for (const [min, max, value, expectedValue] of testCases) {
		const result = utils.ensureRange(min, value, max);
		const failMessage = `Expected ${expectedValue} for ${[min, max, value]} but got ${result}`;
		assert.is(result, expectedValue, failMessage);
	}
});

test(`_getOsNameFromUserAgent returns 'darwin' when userAgent indicates a Mac machine`, assert => {
	const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:57.0) Gecko/20100101 Firefox/57.0';
	const osName = utils._getOsNameFromUserAgent(userAgent);
	assert.is(osName, OSName.MAC);
});

test(`_getOsNameFromUserAgent returns 'other' when userAgent indicates a non-Mac machines`, assert => {
	const userAgent = 'Mozilla/5.0 (X11; Linux x86_64; rv:58.0) Gecko/20100101 Firefox/58.0';
	const osName = utils._getOsNameFromUserAgent(userAgent);
	assert.is(osName, OSName.OTHER);
});
