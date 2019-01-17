import { FuseBox, QuantumPlugin } from 'fuse-box';

const fuse = FuseBox.init({
	homeDir: 'lib',
	target: 'npm',
	output: 'dist/$name.js',
	globals: { default: '*' },
	cache: false,
	sourceMaps: { inline: false, vendor: false },
	natives: false,
	package: 'react-multi-select',
	tsConfig: './tsconfig.json',
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
