import * as vscode from 'vscode';

export const createStatusBarItem = (): vscode.StatusBarItem => {
	const item = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Left,
		100
	);
	item.text = '$(warning) PROTECTED BRANCH';
	item.tooltip = 'You are editing a protected Git branch.';
	item.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	item.color = new vscode.ThemeColor('statusBarItem.errorForeground');
	item.hide();
	return item;
};
