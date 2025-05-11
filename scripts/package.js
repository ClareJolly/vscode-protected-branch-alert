const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const pkgPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

const bumpVersion = (version, type) => {
	const [major, minor, patch] = version.split('.').map(Number);
	if (type === 'major') return `${major + 1}.0.0`;
	if (type === 'minor') return `${major}.${minor + 1}.0`;
	if (type === 'patch') return `${major}.${minor}.${patch + 1}`;
	return version;
};

(async () => {
	const { bump } = await prompts({
		type: 'select',
		name: 'bump',
		message: 'Select version bump:',
		choices: [
			{ title: 'patch', value: 'patch' },
			{ title: 'minor', value: 'minor' },
			{ title: 'major', value: 'major' },
			{ title: 'keep', value: 'keep' },
		],
	});

	const newVersion = bumpVersion(pkg.version, bump);

	if (bump !== 'keep') {
		pkg.version = newVersion;
		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
		console.log(`📦 Version bumped to ${newVersion}`);
	} else {
		console.log(`📦 Keeping version ${pkg.version}`);
	}

	const outDir = path.resolve(__dirname, '../out/dist');
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

	const vsixName = `protected-branch-alert-${pkg.version}.vsix`;
	const outputPath = path.join(outDir, vsixName);

	execSync(`npx vsce package --out ${outputPath}`, { stdio: 'inherit' });
	console.log(`✅ VSIX saved to: ${outputPath}`);

	const latestPath = path.join(outDir, 'protected-branch-alert-latest.vsix');
	fs.copyFileSync(outputPath, latestPath);
	console.log(`✅ Copied to latest: ${latestPath}`);
})();
