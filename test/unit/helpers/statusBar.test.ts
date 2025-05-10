import { createStatusBarItem } from '../../../src/helpers/statusBar';

jest.mock('vscode', () => {
	const showMock = jest.fn();
	const hideMock = jest.fn();

	return {
		window: {
			createStatusBarItem: jest.fn(() => ({
				text: '',
				tooltip: '',
				color: '',
				backgroundColor: '',
				show: showMock,
				hide: hideMock,
			})),
		},
		StatusBarAlignment: {
			Left: 1,
		},
		ThemeColor: class {
			constructor(public id: string) {}
		},
	};
});

import * as vscode from 'vscode';

describe('createStatusBarItem', () => {
	it('creates and configures a status bar item correctly', () => {
		const item = createStatusBarItem();

		expect(item.text).toBe('$(warning) PROTECTED BRANCH');
		expect(item.tooltip).toBe('You are editing a protected Git branch.');
		expect(item.color).toEqual(expect.any(vscode.ThemeColor));
		expect(item.backgroundColor).toEqual(expect.any(vscode.ThemeColor));
		expect(item.hide).toBeDefined();
		expect(typeof item.hide).toBe('function');
	});
});
