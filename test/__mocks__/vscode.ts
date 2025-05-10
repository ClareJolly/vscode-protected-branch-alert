const showWarningMessage = jest.fn(() => Promise.resolve(undefined));
const executeCommand = jest.fn();

const createStatusBarItem = jest.fn(() => ({
	text: '',
	tooltip: '',
	color: '',
	backgroundColor: '',
	show: jest.fn(),
	hide: jest.fn(),
}));

const getConfiguration = jest.fn(() => ({
	get: jest.fn(() => ['main', 'master']),
}));

const onDidChangeTextDocument = jest.fn(() => ({
	dispose: jest.fn(),
}));

export const window = {
	showWarningMessage,
	createStatusBarItem,
};

export const workspace = {
	workspaceFolders: [],
	getConfiguration,
	onDidChangeTextDocument,
};

export const commands = {
	executeCommand,
};

export const StatusBarAlignment = {
	Left: 1,
};

export class ThemeColor {
	constructor(public id: string) {}
}
