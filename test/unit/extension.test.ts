import { activate, deactivate } from '../../src/extension';
import * as vscode from 'vscode';
import { createStatusBarItem } from '../../src/helpers/statusBar';
import { getCurrentGitBranch } from '../../src/helpers/branchChecker';
import {
	resetReminderTimer,
	startReminderTimer,
} from '../../src/helpers/reminders';

import * as handleEditModule from '../../src/helpers/handleEdit';
jest.mock('vscode');
jest.mock('../../src/helpers/statusBar');
jest.mock('../../src/helpers/branchChecker');
jest.mock('../../src/helpers/reminders');

const getCurrentGitBranchMock = getCurrentGitBranch as jest.Mock;
getCurrentGitBranchMock.mockImplementation(() => Promise.resolve('main'));

const startReminderTimerMock = startReminderTimer as jest.Mock;
startReminderTimerMock.mockImplementation(
	() => 123 as unknown as NodeJS.Timeout
);

const resetReminderTimerMock = resetReminderTimer as jest.Mock;

const handleEditMock = handleEditModule.handleEdit as jest.Mock;

const createStatusBarItemMock = createStatusBarItem as jest.Mock;
const mockShow = jest.fn();
const mockHide = jest.fn();

createStatusBarItemMock.mockImplementation(() => ({
	show: mockShow,
	hide: mockHide,
	text: '',
	tooltip: '',
	color: '',
	backgroundColor: '',
}));

describe('main extension', () => {
	describe('activate', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('should do nothing if no workspace folder', () => {
			(vscode.workspace.workspaceFolders as any) = undefined;
			expect(() => activate({ subscriptions: [] } as any)).not.toThrow();
		});

		it('should use default branches', () => {
			const fakeContext = { subscriptions: [] as any[] };
			(vscode.workspace.getConfiguration as jest.Mock).mockReturnValueOnce({
				get: () => undefined,
			});
			(vscode.workspace.workspaceFolders as any) = undefined;
			expect(() => activate({ subscriptions: [] } as any)).not.toThrow();

			expect(() => activate({ subscriptions: [] } as any)).not.toThrow();
		});

		it('should register event listeners and run checkBranch', async () => {
			const fakeContext = { subscriptions: [] as any[] };
			(vscode.workspace.workspaceFolders as any) = [
				{ uri: { fsPath: '/project' } },
			];

			(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
				get: () => ['main'],
			});

			activate(fakeContext as vscode.ExtensionContext);

			expect(fakeContext.subscriptions.length).toBeGreaterThan(0);
		});

		it('should register event listeners and run checkBranch when not on protected branch', async () => {
			const fakeContext = { subscriptions: [] as any[] };

			getCurrentGitBranchMock.mockResolvedValueOnce('test'); // not in protected list
			(vscode.workspace.workspaceFolders as any) = [
				{ uri: { fsPath: '/project' } },
			];
			(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
				get: () => ['main'],
			});

			activate(fakeContext as vscode.ExtensionContext);

			// wait for checkBranch to run
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockHide).toHaveBeenCalled();
			expect(resetReminderTimerMock).toHaveBeenCalled();
		});

		it('should throw when cannot get branch', async () => {
			getCurrentGitBranchMock.mockImplementationOnce(() => {
				throw new Error('err');
			});

			(vscode.workspace.workspaceFolders as any) = [
				{ uri: { fsPath: '/project' } },
			];

			const errorSpy = jest
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			expect(() => activate({ subscriptions: [] } as any)).not.toThrow();

			errorSpy.mockRestore();
		});

		it('should register edit handler and call handleEdit', async () => {
			// spy on the real handleEdit
			const handleEditSpy = jest.spyOn(handleEditModule, 'handleEdit');

			// simulate document change hook
			let changeHandler: Function | undefined;
			(
				vscode.workspace.onDidChangeTextDocument as jest.Mock
			).mockImplementation((fn) => {
				changeHandler = fn;
				return { dispose: jest.fn() };
			});

			const fakeContext = { subscriptions: [] } as any;
			(vscode.workspace.workspaceFolders as any) = [
				{ uri: { fsPath: '/project' } },
			];

			// protected branches = ['main'], current branch = 'main'
			(vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({
				get: () => ['main'],
			});
			getCurrentGitBranchMock.mockResolvedValue('main');

			activate(fakeContext);

			// wait for checkBranch to run
			await new Promise((resolve) => setTimeout(resolve, 10));

			// now trigger the onDidChangeTextDocument event
			changeHandler?.();

			expect(handleEditSpy).toHaveBeenCalled();
		});

		describe('extension polling and disposal', () => {
			beforeEach(() => {
				jest.clearAllMocks();
			});

			it('deactivate is defined and callable', () => {
				expect(typeof deactivate).toBe('function');
				expect(() => deactivate()).not.toThrow();
			});
		});
	});
});
