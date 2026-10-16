import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { captureInventory, compactEntries, run } from './sync-extensions.mjs';

const selfId = 'elmar-local.elles-gearbox';
const observation = [{ source: 'windows', version: '1.0.0' }];
const extension = (id, extensionPack = []) => ({ id, installations: observation, extensionPack });
const snapshot = extensions => ({ schemaVersion: 1, extensions });

function fixture(t) {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'extension-pack-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const manifest = {
    name: 'elles-gearbox',
    publisher: 'elmar-local',
    categories: ['Extension Packs'],
    extensionPack: [],
  };
  writeFileSync(path.join(directory, 'package.json'), JSON.stringify(manifest));
  writeFileSync(path.join(directory, 'README.md'),
    '# Test pack\n\n<!-- extension-inventory:start -->\n<!-- extension-inventory:end -->\n');
  function source(label, extensions) {
    const root = path.join(directory, label);
    mkdirSync(root, { recursive: true });
    const entries = extensions.map(({ id, members = [], builtin = false, version = '1.0.0' }) => {
      const location = id.toLowerCase();
      mkdirSync(path.join(root, location), { recursive: true });
      const [publisher, name] = id.split('.');
      writeFileSync(path.join(root, location, 'package.json'), JSON.stringify({
        publisher, name, version, extensionPack: members,
      }));
      return { identifier: { id }, version, relativeLocation: location, metadata: { isBuiltin: builtin } };
    });
    const file = path.join(root, 'extensions.json');
    writeFileSync(file, JSON.stringify(entries));
    return { label, file };
  }
  return { directory, source };
}

test('normalizes IDs, combines sources, preserves versions and excludes built-ins and itself', t => {
  const { source } = fixture(t);
  const windows = source('windows', [
    { id: 'Publisher.Pack', members: ['Publisher.Theme'] },
    { id: 'Publisher.Theme' },
    { id: 'vscode.git', builtin: true },
    { id: selfId },
  ]);
  const wsl = source('wsl', [
    { id: 'publisher.pack', members: ['publisher.theme'], version: '2.0.0' },
    { id: 'publisher.theme' },
  ]);
  const result = captureInventory([windows, wsl], selfId);
  assert.equal(result.extensions.length, 2);
  assert.deepEqual(compactEntries(result, selfId), ['publisher.pack']);
  assert.deepEqual(result.extensions[0].installations, [
    { source: 'windows', version: '1.0.0' },
    { source: 'wsl', version: '2.0.0' },
  ]);
  assert.deepEqual(captureInventory([wsl, windows], selfId), result);
});

test('recursively covers nested packs, shared members and functional pack parents', () => {
  const input = snapshot([
    extension('p.outer', ['p.inner', 'p.shared']),
    extension('p.inner', ['p.shared']),
    extension('p.other', ['p.shared']),
    extension('p.shared'),
    extension('p.functional', ['p.audio']),
    extension('p.audio'),
    extension('p.standalone'),
  ]);
  assert.deepEqual(compactEntries(input, selfId), ['p.functional', 'p.other', 'p.outer', 'p.standalone']);
});

test('rejects missing members, cycles including disconnected cycles, and empty inventories', () => {
  assert.throws(() => compactEntries(snapshot([extension('p.pack', ['p.missing'])]), selfId), /missing from the inventory/);
  assert.throws(() => compactEntries(snapshot([
    extension('p.root'), extension('p.first', ['p.second']), extension('p.second', ['p.first']),
  ]), selfId), /cycle/);
  assert.throws(() => compactEntries(snapshot([extension('p.self', ['p.self'])]), selfId), /cycle/);
  assert.throws(() => compactEntries(snapshot([]), selfId), /empty/);
});

test('rejects malformed snapshots, duplicates, self references and invalid observations', () => {
  const invalid = [
    null,
    snapshot([extension('bad-id')]),
    snapshot([extension('P.Upper')]),
    snapshot([extension('p.one'), extension('p.one')]),
    snapshot([extension(selfId)]),
    snapshot([extension('p.one', ['p.two', 'p.two']), extension('p.two')]),
    snapshot([{ ...extension('p.one'), installations: [] }]),
    snapshot([{ ...extension('p.one'), installations: [null] }]),
    snapshot([{ ...extension('p.one'), installations: [{ version: '1.0.0' }] }]),
  ];
  for (const input of invalid) assert.throws(() => compactEntries(input, selfId));
});

test('rejects conflicting pack membership across sources', t => {
  const { source } = fixture(t);
  const windows = source('windows', [{ id: 'p.pack' }]);
  const wsl = source('wsl', [{ id: 'p.pack', members: ['p.child'] }, { id: 'p.child' }]);
  assert.throws(() => captureInventory([windows, wsl], selfId), /Conflicting pack membership/);
});

test('rejects unreadable, malformed, duplicate and inconsistent inventory sources', t => {
  const { directory, source } = fixture(t);
  assert.throws(() => captureInventory([], selfId), /at least one/);
  assert.throws(() => captureInventory([{ label: 'wsl', file: path.join(directory, 'missing') }], selfId), /Cannot read JSON/);
  const good = source('wsl', [{ id: 'p.one' }]);
  assert.throws(() => captureInventory([good, good], selfId), /duplicate source label/);
  const entry = JSON.parse(readFileSync(good.file, 'utf8'))[0];
  writeFileSync(good.file, '{}');
  assert.throws(() => captureInventory([good], selfId), /registry array/);
  writeFileSync(good.file, JSON.stringify([entry, entry]));
  assert.throws(() => captureInventory([good], selfId), /Duplicate extension/);
  writeFileSync(good.file, JSON.stringify([{ ...entry, version: '2.0.0' }]));
  assert.throws(() => captureInventory([good], selfId), /Version mismatch/);
  writeFileSync(good.file, JSON.stringify([{ ...entry, identifier: { id: 'p.other' } }]));
  assert.throws(() => captureInventory([good], selfId), /identity/);
  writeFileSync(good.file, JSON.stringify([entry]));
  const manifestPath = path.join(path.dirname(good.file), entry.relativeLocation, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  writeFileSync(manifestPath, JSON.stringify({ ...manifest, extensionPack: null }));
  assert.throws(() => captureInventory([good], selfId), /must be an array/);
  writeFileSync(good.file, '{invalid');
  assert.throws(() => captureInventory([good], selfId), /Cannot read JSON/);
});

test('reads installed manifests from absolute registry locations', t => {
  const { source } = fixture(t);
  const input = source('wsl', [{ id: 'p.one' }]);
  const entries = JSON.parse(readFileSync(input.file, 'utf8'));
  entries[0].location = { path: path.join(path.dirname(input.file), entries[0].relativeLocation) };
  delete entries[0].relativeLocation;
  writeFileSync(input.file, JSON.stringify(entries));
  assert.deepEqual(compactEntries(captureInventory([input], selfId), selfId), ['p.one']);
});

test('previews without writes, explicitly writes, validates and regenerates identical output', t => {
  const { directory, source } = fixture(t);
  const input = source('wsl', [{ id: 'p.pack', members: ['p.child'] }, { id: 'p.child' }]);
  const args = ['--source', `wsl=${input.file}`];
  const manifestPath = path.join(directory, 'package.json');
  const snapshotPath = path.join(directory, 'extensions.snapshot.json');
  const readmePath = path.join(directory, 'README.md');
  const original = readFileSync(manifestPath, 'utf8');
  const originalReadme = readFileSync(readmePath, 'utf8');
  const messages = [];
  run(args, directory, message => messages.push(message));
  assert.equal(readFileSync(manifestPath, 'utf8'), original);
  assert.equal(readFileSync(readmePath, 'utf8'), originalReadme);
  assert.throws(() => readFileSync(snapshotPath), /ENOENT/);
  assert.ok(messages.some(message => message.startsWith('+ inventory p.child')));
  run([...args, '--write'], directory, () => {});
  const saved = [readFileSync(manifestPath, 'utf8'), readFileSync(snapshotPath, 'utf8'),
    readFileSync(readmePath, 'utf8')];
  assert.match(saved[2], /All \*\*2 extensions\*\*/);
  assert.match(saved[2], /\| \[p.child\]\(https:\/\/marketplace.visualstudio.com\/items\?itemName=p.child\) \| \[p.pack\]/);
  assert.match(saved[2], /\| \[p.pack\].* \| Direct entry \|/);
  run(['--check'], directory, () => {});
  run(args, directory, () => {});
  run([...args, '--write'], directory, () => {});
  assert.deepEqual([readFileSync(manifestPath, 'utf8'), readFileSync(snapshotPath, 'utf8'),
    readFileSync(readmePath, 'utf8')], saved);
  const windowsReadme = saved[2].replaceAll('\n', '\r\n');
  writeFileSync(readmePath, windowsReadme);
  run(['--check'], directory, () => {});
  run([...args, '--write'], directory, () => {});
  assert.equal(readFileSync(readmePath, 'utf8'), windowsReadme);
  writeFileSync(readmePath, saved[2].replace('All **2 extensions**', 'All **99 extensions**'));
  assert.throws(() => run(['--check'], directory, () => {}), /README.md inventory is out of date/);
  writeFileSync(readmePath, saved[2]);
  const manifest = JSON.parse(saved[0]);
  manifest.extensionPack.push('p.child');
  writeFileSync(manifestPath, JSON.stringify(manifest));
  assert.throws(() => run(['--check'], directory, () => {}), /does not match/);
});

test('shows removals, changed pack relations and observed versions before updating', t => {
  const { directory, source } = fixture(t);
  let input = source('wsl', [{ id: 'p.pack', members: ['p.child'] }, { id: 'p.child' }]);
  run(['--source', `wsl=${input.file}`, '--write'], directory, () => {});
  input = source('wsl', [{ id: 'p.pack', version: '2.0.0' }]);
  const messages = [];
  run(['--source', `wsl=${input.file}`], directory, message => messages.push(message));
  assert.ok(messages.includes('- inventory p.child'));
  assert.ok(messages.some(message => message.startsWith('~ pack p.pack:')));
  assert.ok(messages.some(message => message.startsWith('~ observations p.pack:')));
  assert.equal(JSON.parse(readFileSync(path.join(directory, 'extensions.snapshot.json'))).extensions.length, 2);
});

test('requires all previously captured sources and leaves both files intact on invalid input', t => {
  const { directory, source } = fixture(t);
  const windows = source('windows', [{ id: 'p.one' }]);
  const wsl = source('wsl', [{ id: 'p.two' }]);
  const args = ['--source', `windows=${windows.file}`, '--source', `wsl=${wsl.file}`];
  run([...args, '--write'], directory, () => {});
  const files = ['package.json', 'extensions.snapshot.json', 'README.md'].map(file => path.join(directory, file));
  const before = files.map(file => readFileSync(file, 'utf8'));
  assert.throws(() => run(['--source', `wsl=${wsl.file}`, '--write'], directory, () => {}), /Missing previously captured source/);
  writeFileSync(wsl.file, '{}');
  assert.throws(() => run([...args, '--write'], directory, () => {}), /registry array/);
  assert.deepEqual(files.map(file => readFileSync(file, 'utf8')), before);
});

test('rejects missing, duplicate and reversed README markers before writing outputs', t => {
  const { directory, source } = fixture(t);
  const input = source('wsl', [{ id: 'p.one' }]);
  const manifestPath = path.join(directory, 'package.json');
  const original = readFileSync(manifestPath, 'utf8');
  for (const content of [
    '# No markers',
    '<!-- extension-inventory:end --><!-- extension-inventory:start -->',
    '<!-- extension-inventory:start --><!-- extension-inventory:start --><!-- extension-inventory:end -->',
  ]) {
    writeFileSync(path.join(directory, 'README.md'), content);
    assert.throws(() => run(['--source', `wsl=${input.file}`, '--write'], directory, () => {}), /ordered pair/);
    assert.equal(readFileSync(manifestPath, 'utf8'), original);
    assert.throws(() => readFileSync(path.join(directory, 'extensions.snapshot.json')), /ENOENT/);
  }
});

test('rejects unsupported CLI options and incompatible modes', t => {
  const { directory } = fixture(t);
  for (const args of [['--unknown'], ['--source'], ['--source', 'invalid'], ['--check', '--write']]) {
    assert.throws(() => run(args, directory, () => {}));
  }
});

test('approved project contains 36 entries covered by 24 direct entries and four nested parents', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const saved = JSON.parse(readFileSync(path.join(root, 'extensions.snapshot.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
  const table = readme.split('<!-- extension-inventory:start -->')[1]
    .split('<!-- extension-inventory:end -->')[0];
  const rows = table.split('\n').filter(line => line.startsWith('| ['));
  assert.equal(rows.length, saved.extensions.length);
  for (const entry of saved.extensions) {
    assert.equal(rows.filter(row => row.startsWith(`| [${entry.id}](`)).length, 1);
  }
  assert.equal(manifest.name, 'elles-gearbox');
  assert.equal(manifest.displayName, "Elle's Gearbox");
  assert.equal(manifest.icon, 'assets/icon.png');
  const icon = readFileSync(path.join(root, manifest.icon));
  assert.deepEqual([...icon.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(icon.readUInt32BE(16), 256);
  assert.equal(icon.readUInt32BE(20), 256);
  assert.equal(`${manifest.publisher}.${manifest.name}`, selfId);
  const direct = compactEntries(saved, selfId);
  assert.equal(saved.extensions.length, 36);
  assert.equal(direct.length, 24);
  assert.equal(saved.extensions.length - direct.length, 12);
  assert.deepEqual(manifest.extensionPack, direct);
  const parents = saved.extensions.filter(entry => entry.extensionPack.length > 0);
  assert.deepEqual(parents.map(entry => entry.id), [
    'catppuccin.catppuccin-vsc-pack', 'openai.chatgpt',
    'vmware.vscode-boot-dev-pack', 'vscjava.vscode-java-pack',
  ]);
  for (const parent of parents) {
    assert.ok(direct.includes(parent.id));
    for (const child of parent.extensionPack) assert.ok(!direct.includes(child));
  }
});
