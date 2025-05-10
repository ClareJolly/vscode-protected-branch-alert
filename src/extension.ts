import * as vscode from 'vscode';
import {
	getCurrentGitBranch,
	createStatusBarItem,
	resetReminderTimer,
	handleEdit,
} from './helpers';

let branchPollInterval: NodeJS.Timeout;

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

	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(() => {
			handleEdit({
				branch: currentBranch,
				currentlyOnProtectedBranch,
				warned: warnedThisBranch,
				setWarned: (v) => (warnedThisBranch = v),
				reminderTimeout,
				setReminderTimeout: (t) => (reminderTimeout = t),
			});
		})
	);

	const intervalId = setInterval(() => {
		checkBranch();
	}, 3000);

	branchPollInterval = intervalId;

	context.subscriptions.push({
		dispose: () => {
			clearInterval(intervalId);
		},
	});

	checkBranch();
};

export const deactivate = () => {
	if (branchPollInterval) {
		clearInterval(branchPollInterval);
	}
};
