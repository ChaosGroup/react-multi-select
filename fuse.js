const { FuseBox, QuantumPlugin } = require('fuse-box');

const fuse = FuseBox.init({
	homeDir: 'lib',
	target: 'browser',
	output: 'dist/$name.js',
	cache: false,
	sourceMaps: { inline: false, vendor: false },
	natives: false,
	package: 'react-multi-select',
	plugins: [
		QuantumPlugin({
			containedAPI: true,
			ensureES5: true,
			uglify: true,
			treeshake: true,
			bakeApiIntoBundle: 'index'
		})
	]
});

fuse
	.bundle('index')
	.instructions('+ [*.tsx]');

fuse.run();
