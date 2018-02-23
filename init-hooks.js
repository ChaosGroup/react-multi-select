const fs = require('fs');
const path = require('path');

const HOOKS_DIR = path.resolve(__dirname, 'git-hooks');
const hooks = fs.readdirSync(HOOKS_DIR);

for (const hookName of hooks) {
	try {
		const fullHookPath = path.resolve(HOOKS_DIR, hookName);
		const hookDestPath = path.resolve(__dirname, '.git', 'hooks', hookName);
		fs.createReadStream(fullHookPath)
			.pipe(fs.createWriteStream(hookDestPath))
			.on('close', fs.chmodSync.bind(fs, hookDestPath, 0o765));
	} catch (error) {
		console.log(`Could not init hook ${hookName}. Error: ${error}`);
	}
}

console.log('Finished initializing git hooks');
