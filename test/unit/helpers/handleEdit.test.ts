// test/helpers/onEdit.test.ts
import { handleEdit } from '../../../src/helpers/handleEdit';
import * as reminders from '../../../src/helpers/reminders';
import * as vscode from 'vscode';

jest.mock('vscode');
jest.mock('../../../src/helpers/reminders');

const mockShowWarningMessage = vscode.window.showWarningMessage as jest.Mock;
const mockExecuteCommand = vscode.commands.executeCommand as jest.Mock;
const mockStartReminderTimer = reminders.startReminderTimer as jest.Mock;
const mockResetReminderTimer = reminders.resetReminderTimer as jest.Mock;

describe('handleEdit', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('shows warning and sets reminder on first edit', async () => {
		mockShowWarningMessage.mockResolvedValue('Ignore');
		const setWarned = jest.fn();
		const setReminderTimeout = jest.fn();

		handleEdit({
			branch: 'main',
			currentlyOnProtectedBranch: true,
			warned: false,
			setWarned,
			reminderTimeout: undefined,
			setReminderTimeout,
		});

		await Promise.resolve();

		expect(mockShowWarningMessage).toHaveBeenCalledWith(
			expect.stringContaining('main'),
			'Create New Branch',
			'Ignore'
		);
		expect(setWarned).toHaveBeenCalledWith(true);
		expect(mockStartReminderTimer).toHaveBeenCalled();
		expect(setReminderTimeout).toHaveBeenCalled();
	});

	it('executes git.branch when "Create New Branch" is selected', async () => {
		mockShowWarningMessage.mockResolvedValue('Create New Branch');
		const setWarned = jest.fn();
		const setReminderTimeout = jest.fn();

		handleEdit({
			branch: 'main',
			currentlyOnProtectedBranch: true,
			warned: false,
			setWarned,
			reminderTimeout: undefined,
			setReminderTimeout,
		});

		await Promise.resolve();

		expect(mockExecuteCommand).toHaveBeenCalledWith('git.branch');
	});

	it('resets and restarts timer when already warned', () => {
		const setWarned = jest.fn();
		const setReminderTimeout = jest.fn();
		const fakeTimer = {} as NodeJS.Timeout;

		handleEdit({
			branch: 'main',
			currentlyOnProtectedBranch: true,
			warned: true,
			setWarned,
			reminderTimeout: fakeTimer,
			setReminderTimeout,
		});

		expect(mockResetReminderTimer).toHaveBeenCalledWith(fakeTimer);
		expect(mockStartReminderTimer).toHaveBeenCalled();
		expect(setReminderTimeout).toHaveBeenCalled();
	});
});
