import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { generateNotes } from '@semantic-release/release-notes-generator';

const config = JSON.parse(readFileSync(new URL('../.releaserc.json', import.meta.url), 'utf8'));
const options = config.plugins.find(([name]) => name === '@semantic-release/commit-analyzer')[1];
const logger = { log() {} };

async function analyze(messages) {
  return analyzeCommits(options, {
    cwd: process.cwd(),
    commits: messages.map(message => ({ message })),
    logger,
  });
}

test('Conventional Commits release fix as patch and feat as minor', async () => {
  assert.equal(await analyze(['fix: correct inventory normalization']), 'patch');
  assert.equal(await analyze(['fix(pack): restore missing extension']), 'patch');
  assert.equal(await analyze(['feat: add development tools']), 'minor');
  assert.equal(await analyze(['fix: correct icon', 'feat(pack): add tools']), 'minor');
});

test('maintenance-only commits do not create releases', async () => {
  for (const type of ['chore', 'docs', 'test', 'ci', 'build', 'refactor', 'style']) {
    assert.equal(await analyze([`${type}: maintain the project`]), null);
  }
  assert.equal(await analyze(['chore: update dependencies', 'docs: clarify setup']), null);
  assert.equal(await analyze(['chore: update dependencies', 'fix: restore coverage']), 'patch');
});

test('breaking changes create major releases including breaking chores', async () => {
  assert.equal(await analyze(['feat!: replace the extension selection']), 'major');
  assert.equal(await analyze(['fix(pack)!: remove obsolete setup support']), 'major');
  assert.equal(await analyze(['chore!: replace the installation contract']), 'major');
  assert.equal(await analyze(['chore: replace the installation contract\n\nBREAKING CHANGE: Old setup is no longer supported.']), 'major');
});

test('release notes use the repository and Conventional Commits preset', async () => {
  const notesOptions = config.plugins.find(([name]) => name === '@semantic-release/release-notes-generator')[1];
  const notes = await generateNotes(notesOptions, {
    cwd: process.cwd(),
    options: { repositoryUrl: config.repositoryUrl },
    commits: [{ message: 'feat: add toolbox branding', hash: '1234567890abcdef1234567890abcdef12345678' }],
    lastRelease: { version: '1.0.0', gitTag: 'v1.0.0' },
    nextRelease: { version: '1.1.0', gitTag: 'v1.1.0' },
    logger,
  });
  assert.match(notes, /add toolbox branding/);
  assert.match(notes, /github\.com\/ellevaoche\/elles-gearbox/);
  assert.match(notes, /1\.1\.0/);
});

test('release prepares the version before packaging and publishes only the exact VSIX to GitHub', () => {
  assert.deepEqual(config.branches, ['main']);
  assert.equal(config.tagFormat, 'v${version}');
  const names = config.plugins.map(([name]) => name);
  assert.ok(names.indexOf('@semantic-release/npm') < names.indexOf('@semantic-release/exec'));
  assert.ok(names.indexOf('@semantic-release/exec') < names.indexOf('@semantic-release/github'));
  assert.equal(config.plugins.find(([name]) => name === '@semantic-release/npm')[1].npmPublish, false);
  assert.equal(config.plugins.find(([name]) => name === '@semantic-release/exec')[1].prepareCmd,
    'npm run package -- --out elles-gearbox.vsix');
  const github = config.plugins.find(([name]) => name === '@semantic-release/github')[1];
  assert.equal(github.assets[0].path, 'elles-gearbox.vsix');
  assert.equal(github.assets[0].name, 'elles-gearbox-${nextRelease.version}.vsix');
  assert.ok(!github.assets[0].path.includes('${'));
  assert.equal(github.successComment, false);
  assert.equal(github.failComment, false);
  assert.equal(github.releasedLabels, false);
  assert.ok(!names.includes('@semantic-release/git'));
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.private, true);
  assert.equal(manifest.repository.url, config.repositoryUrl);
});
