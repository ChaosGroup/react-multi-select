const { FuseBox, QuantumPlugin } = require('fuse-box');

const fuse = FuseBox.init({
	homeDir: 'lib',
	target: 'browser',
	output: 'dist/$name.js',
	cache: false,
	sourceMaps: { inline: false, vendor: false },
	natives: false,
	package: 'rct-mlt-slct',
	plugins: [
		QuantumPlugin({
			containedAPI: true,
			ensureES5: true,
			uglify: true,
			bakeApiIntoBundle: 'index'
		})
	]
});

fuse
	.bundle('index')
	.instructions('> [**/!(*.spec*).{tsx,ts}]');

fuse.run();
