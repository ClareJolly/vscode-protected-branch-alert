import { getCurrentGitBranch } from '../../../src/helpers/branchChecker';
import * as cp from 'child_process';

jest.mock('child_process');
const mockedExec = cp.exec as unknown as jest.Mock;

describe('getCurrentGitBranch', () => {
	const cwd = '/fake/path';

	it('resolves with trimmed stdout', async () => {
		mockedExec.mockImplementation((_cmd, _opts, cb) => cb(null, 'main\n'));

		const result = await getCurrentGitBranch(cwd);
		expect(result).toBe('main');
	});

	it('rejects when exec returns an error', async () => {
		mockedExec.mockImplementation((_cmd, _opts, cb) =>
			cb(new Error('fail'), '')
		);

		await expect(getCurrentGitBranch(cwd)).rejects.toThrow('fail');
	});
});
