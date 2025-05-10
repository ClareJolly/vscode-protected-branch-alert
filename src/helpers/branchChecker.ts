import * as cp from 'child_process';

export const getCurrentGitBranch = (workspacePath: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		cp.exec(
			'git rev-parse --abbrev-ref HEAD',
			{ cwd: workspacePath },
			(err, stdout) => {
				if (err) return reject(err);
				resolve(stdout.trim());
			}
		);
	});
};
