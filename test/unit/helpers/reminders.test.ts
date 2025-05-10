import {
	startReminderTimer,
	resetReminderTimer,
} from '../../../src/helpers/reminders';

jest.useFakeTimers();

jest.mock('vscode', () => ({
	window: {
		showWarningMessage: jest.fn(),
	},
	commands: {
		executeCommand: jest.fn(),
	},
}));

import * as vscode from 'vscode';

describe('reminders', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('calls showWarningMessage and then onReset when ignored', async () => {
		(vscode.window.showWarningMessage as jest.Mock).mockResolvedValue('Ignore');
		const onReset = jest.fn();
		startReminderTimer('main', onReset);

		jest.advanceTimersByTime(10 * 60 * 1000);
		await Promise.resolve();

		expect(vscode.window.showWarningMessage).toHaveBeenCalled();
		expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
		expect(onReset).toHaveBeenCalled();
	});

	it('calls executeCommand when user selects "Create New Branch"', async () => {
		(vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(
			'Create New Branch'
		);
		const onReset = jest.fn();
		startReminderTimer('main', onReset);

		jest.advanceTimersByTime(10 * 60 * 1000);
		await Promise.resolve();

		expect(vscode.window.showWarningMessage).toHaveBeenCalled();
		expect(vscode.commands.executeCommand).toHaveBeenCalledWith('git.branch');
		expect(onReset).toHaveBeenCalled();
	});

	it('should cancel timer when resetReminderTimer is called', () => {
		const onReset = jest.fn();
		const timer = startReminderTimer('main', onReset);
		resetReminderTimer(timer);

		jest.advanceTimersByTime(10 * 60 * 1000);
		expect(onReset).not.toHaveBeenCalled();
	});
});
