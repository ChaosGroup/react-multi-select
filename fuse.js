const { FuseBox, QuantumPlugin } = require('fuse-box');

const fuse = FuseBox.init({
	homeDir: 'lib',
	target: 'npm',
	output: 'dist/$name.js',
	globals: { 'default': '*' },
	cache: false,
	sourceMaps: { inline: false, vendor: false },
	natives: false,
	package: 'react-multi-select',
	tsConfig: [{ target: 'es6' }],
	plugins: [
		QuantumPlugin({
			bakeApiIntoBundle: 'es6',
			containedAPI: true,
			globalRequire: false,
			uglify: true
		})
	]
});


const instructions = fuse.bundle('es6').instructions('> [index.ts]');

fuse.run();
