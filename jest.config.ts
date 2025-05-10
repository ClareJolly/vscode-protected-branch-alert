module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json'],
	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				isolatedModules: true,
			},
		],
	},
	moduleNameMapper: {
		'^vscode$': '<rootDir>/test/__mocks__/vscode.ts',
	},
};
