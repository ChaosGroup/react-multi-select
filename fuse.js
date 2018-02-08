const { FuseBox, QuantumPlugin } = require('fuse-box');

const fuse = FuseBox.init({
	homeDir: 'lib',
	target: 'browser@es6',
	output: 'dist/$name.js',
	globals: { 'default': '*' },
	cache: false,
	sourceMaps: { inline: false, vendor: false },
	natives: false,
	package: 'react-multi-select',
	tsConfig: [{ target: 'es6' }],
	plugins: [
		QuantumPlugin({
			containedAPI: true,
			// ensureES5: true,
			// uglify: true,
			bakeApiIntoBundle: 'es6'
		})
	]
});

fuse
	.bundle('es6')
	.instructions('> [index.tsx]');

fuse.run();
