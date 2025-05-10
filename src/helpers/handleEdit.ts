import * as vscode from 'vscode';
import { startReminderTimer, resetReminderTimer } from './reminders';

export interface OnEditOptions {
	branch: string;
	currentlyOnProtectedBranch: boolean;
	warned: boolean;
	setWarned: (value: boolean) => void;
	reminderTimeout?: NodeJS.Timeout;
	setReminderTimeout: (t: NodeJS.Timeout) => void;
}

export const handleEdit = ({
	branch,
	currentlyOnProtectedBranch,
	warned,
	setWarned,
	reminderTimeout,
	setReminderTimeout,
}: OnEditOptions): void => {
	if (currentlyOnProtectedBranch && !warned) {
		setWarned(true);
		vscode.window
			.showWarningMessage(
				`You're editing files on the protected branch "${branch}".`,
				'Create New Branch',
				'Ignore'
			)
			.then((selection) => {
				if (selection === 'Create New Branch') {
					vscode.commands.executeCommand('git.branch');
				}
				const timeout = startReminderTimer(branch, () => setWarned(false));
				setReminderTimeout(timeout);
			});
	} else if (currentlyOnProtectedBranch) {
		resetReminderTimer(reminderTimeout);
		const timeout = startReminderTimer(branch, () => setWarned(false));
		setReminderTimeout(timeout);
	}
};
