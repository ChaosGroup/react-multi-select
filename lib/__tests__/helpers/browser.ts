import { JSDOM } from 'jsdom';

const { window } = new JSDOM(`
	<!DOCTYPE html>
	<html>
		<head></head>
		<body></body>
	</html>
`);

const copyProperties = (src, target) => {
	const propertiesToDefine = Object.getOwnPropertyNames(src)
		.filter(propKey => typeof target[propKey] === 'undefined')
		.reduce((propMap, propKey) => ({
			...propMap,
			[propKey]: Object.getOwnPropertyDescriptor(src, propKey)
		}), {});

	Object.defineProperties(target, propertiesToDefine);
}

Object.assign(global, {
	window,
	document: window.document,
	navigator: { userAgent: 'node.js' }
});

copyProperties(window, global);
