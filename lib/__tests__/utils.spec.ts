import './helpers/browser';
import test from 'ava';
import * as utils from '../utils';
import { OSName } from '../constants';

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
