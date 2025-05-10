import * as vscode from 'vscode';
import * as cp from 'child_process';

function getCurrentGitBranch(workspacePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		cp.exec(
			'git rev-parse --abbrev-ref HEAD',
			{ cwd: workspacePath },
			(err, stdout, stderr) => {
				if (err) {
					console.error('Failed to get current branch:', stderr);
					return reject(err);
				}
				resolve(stdout.trim());
			}
		);
	});
}

export function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		console.warn('No workspace folder open.');
		return;
	}

	const workspacePath = workspaceFolders[0].uri.fsPath;
	let lastBranch = '';
	let hasWarnedThisBranch = false;

	const getProtectedBranches = (): string[] => {
		const branches = vscode.workspace
			.getConfiguration('branchAlert')
			.get<string[]>('protectedBranches') || ['main', 'master'];
		console.log('Configured protected branches:', branches);
		return branches;
	};

	const warnIfOnProtectedBranch = async () => {
		console.log('Checking current Git branch...');
		try {
			const branch = await getCurrentGitBranch(workspacePath);
			console.log('Current branch:', branch);

			const protectedBranches = getProtectedBranches();

			if (branch !== lastBranch) {
				console.log(`Branch changed: ${lastBranch} → ${branch}`);
				lastBranch = branch;
				hasWarnedThisBranch = false;
			}

			if (protectedBranches.includes(branch) && !hasWarnedThisBranch) {
				hasWarnedThisBranch = true;
				console.warn(`Editing on protected branch: ${branch}`);
				vscode.window
					.showWarningMessage(
						`You are editing files directly on the "${branch}" branch.`,
						'Create New Branch',
						'Ignore'
					)
					.then((selection) => {
						if (selection === 'Create New Branch') {
							vscode.commands.executeCommand('git.branch');
						}
					});
			}
		} catch (e) {
			console.error('Error checking Git branch:', e);
		}
	};

	// Trigger on edit
	const fileChangeWatcher = vscode.workspace.onDidChangeTextDocument((e) => {
		console.log('File changed:', e.document.uri.fsPath);
		warnIfOnProtectedBranch();
	});

	// Periodic check (e.g., for manual branch switch)
	const branchPollInterval = setInterval(() => {
		warnIfOnProtectedBranch();
	}, 3000);

	context.subscriptions.push(fileChangeWatcher);
	context.subscriptions.push({
		dispose: () => clearInterval(branchPollInterval),
	});

	// Initial check
	warnIfOnProtectedBranch();
}

export function deactivate() {
	console.log('Branch alert extension deactivated.');
}
