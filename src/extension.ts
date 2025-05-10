import * as vscode from 'vscode';
import * as cp from 'child_process';

function getCurrentGitBranch(workspacePath: string): Promise<string> {
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
}

export function activate(context: vscode.ExtensionContext) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) return;

	const workspacePath = workspaceFolders[0].uri.fsPath;
	let currentBranch = '';
	let warnedThisBranch = false;
	let reminderTimeout: NodeJS.Timeout | undefined;
	let currentlyOnProtectedBranch = false;

	const statusBarWarning = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100
	);
	statusBarWarning.text = '$(warning) PROTECTED BRANCH';
	statusBarWarning.tooltip = 'You are editing a protected Git branch.';
	statusBarWarning.backgroundColor = new vscode.ThemeColor(
		'statusBarItem.errorBackground'
	);
	statusBarWarning.color = new vscode.ThemeColor(
		'statusBarItem.errorForeground'
	);
	statusBarWarning.hide();
	context.subscriptions.push(statusBarWarning);

	const getProtectedBranches = (): string[] => {
		return (
			vscode.workspace
				.getConfiguration('branchAlert')
				.get<string[]>('protectedBranches') || ['main', 'master']
		);
	};

	const resetReminderTimer = () => {
		if (reminderTimeout) {
			clearTimeout(reminderTimeout);
			reminderTimeout = undefined;
		}
	};

	const startReminderTimer = (branch: string) => {
		resetReminderTimer();
		reminderTimeout = setTimeout(() => {
			vscode.window
				.showWarningMessage(
					`Reminder: you're still editing on the protected branch "${branch}".`,
					'Create New Branch',
					'Ignore'
				)
				.then((selection) => {
					if (selection === 'Create New Branch') {
						vscode.commands.executeCommand('git.branch');
					}
					warnedThisBranch = false;
				});
		}, 10 * 60 * 1000);
	};

	const checkBranch = async () => {
		try {
			const branch = await getCurrentGitBranch(workspacePath);
			const protectedBranches = getProtectedBranches();
			currentBranch = branch;
			currentlyOnProtectedBranch = protectedBranches.includes(branch);

			if (currentlyOnProtectedBranch) {
				statusBarWarning.show();
			} else {
				statusBarWarning.hide();
				warnedThisBranch = false;
				resetReminderTimer();
			}
		} catch (e) {
			console.error('Error checking Git branch:', e);
		}
	};

	const onEdit = () => {
		if (currentlyOnProtectedBranch && !warnedThisBranch) {
			warnedThisBranch = true;
			vscode.window
				.showWarningMessage(
					`You're editing files on the protected branch "${currentBranch}".`,
					'Create New Branch',
					'Ignore'
				)
				.then((selection) => {
					if (selection === 'Create New Branch') {
						vscode.commands.executeCommand('git.branch');
					}
					startReminderTimer(currentBranch);
				});
		} else if (currentlyOnProtectedBranch) {
			resetReminderTimer();
			startReminderTimer(currentBranch);
		}
	};

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(() => {
			onEdit();
		})
	);

	const branchPollInterval = setInterval(() => {
		checkBranch();
	}, 3000);
	context.subscriptions.push({
		dispose: () => clearInterval(branchPollInterval),
	});

	checkBranch();
}

export function deactivate() {}
