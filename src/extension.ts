import * as vscode from 'vscode';
import {
	getCurrentGitBranch,
	startReminderTimer,
	createStatusBarItem,
	resetReminderTimer,
} from './helpers';

export const activate = (context: vscode.ExtensionContext) => {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders || workspaceFolders.length === 0) return;

	const workspacePath = workspaceFolders[0].uri.fsPath;
	let currentBranch = '';
	let warnedThisBranch = false;
	let reminderTimeout: NodeJS.Timeout | undefined;
	let currentlyOnProtectedBranch = false;

	const statusBarWarning = createStatusBarItem();
	context.subscriptions.push(statusBarWarning);

	const getProtectedBranches = (): string[] => {
		return (
			vscode.workspace
				.getConfiguration('branchAlert')
				.get<string[]>('protectedBranches') || ['main', 'master']
		);
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
				resetReminderTimer(reminderTimeout);
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
					reminderTimeout = startReminderTimer(currentBranch, () => {
						warnedThisBranch = false;
					});
				});
		} else if (currentlyOnProtectedBranch) {
			resetReminderTimer(reminderTimeout);
			reminderTimeout = startReminderTimer(currentBranch, () => {
				warnedThisBranch = false;
			});
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
};

export const deactivate = () => {};
