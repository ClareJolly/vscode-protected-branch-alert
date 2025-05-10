import * as vscode from 'vscode';

export const startReminderTimer = (
	branch: string,
	onReset: () => void
): NodeJS.Timeout => {
	return setTimeout(() => {
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
				onReset();
			});
	}, 10 * 60 * 1000); // 10 minutes
};

export const resetReminderTimer = (
	timeout: NodeJS.Timeout | undefined
): void => {
	if (timeout) {
		clearTimeout(timeout);
	}
};
