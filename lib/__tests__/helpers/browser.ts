import { JSDOM } from 'jsdom';
import * as enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

const { window } = new JSDOM(`
	<!DOCTYPE html>
	<html>
		<head></head>
		<body></body>
	</html>
`);

const copyProperties = (src: object, target: object) => {
	const propertiesToDefine = Object.getOwnPropertyNames(src)
		.filter(key => !target.hasOwnProperty(key))
		.map(key => ({ [key]: Object.getOwnPropertyDescriptor(src, key) }));

	Object.defineProperties(
		target,
		Object.assign({}, ...propertiesToDefine)
	);
};

Object.assign(global, {
	window,
	document: window.document,
	navigator: { userAgent: 'node.js' }
});

copyProperties(window, global);

enzyme.configure({ adapter: new Adapter });