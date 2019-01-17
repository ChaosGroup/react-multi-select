import * as fs from 'fs';
import * as path from 'path';

const HOOKS_DIR = path.resolve(__dirname, 'git-hooks');
const hooks = fs.readdirSync(HOOKS_DIR);

for (const hookName of hooks) {
	try {
		const fullHookPath = path.resolve(HOOKS_DIR, hookName);
		const hookDestPath = path.resolve(__dirname, '.git', 'hooks', hookName);
		fs.copyFileSync(fullHookPath, hookDestPath);
		fs.chmodSync(hookDestPath, 0o765);
	} catch (error) {
		process.stderr.write(`Could not init hook ${hookName}. Error: ${error}\n`);
	}
}

process.stdout.write('Finished initializing git hooks\n');
