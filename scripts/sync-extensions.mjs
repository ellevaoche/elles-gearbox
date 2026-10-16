import {
  existsSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = fileURLToPath(new URL('../', import.meta.url));
const idPattern = /^[a-z0-9][a-z0-9_-]*\.[a-z0-9][a-z0-9_-]*$/;
const sourcePattern = /^[a-z][a-z0-9-]*$/;
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeId(value) {
  requireValue(typeof value === 'string' && idPattern.test(value.toLowerCase()),
    `Invalid extension ID: ${JSON.stringify(value)}`);
  return value.toLowerCase();
}

function normalizeMembers(value, id) {
  requireValue(Array.isArray(value), `extensionPack must be an array for ${id}`);
  return [...new Set(value.map(normalizeId))].sort();
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot read JSON from ${file}: ${error.message}`, { cause: error });
  }
}

function installedDirectory(entry, registry) {
  let directory = entry.location?.path;
  if (typeof directory === 'string') {
    if (/^\/[a-z]:\//i.test(directory)) {
      directory = process.platform === 'win32'
        ? directory.slice(1)
        : `/mnt/${directory[1].toLowerCase()}${directory.slice(3)}`;
    }
    requireValue(path.isAbsolute(directory), `Extension location must be absolute in ${registry}`);
    return directory;
  }
  requireValue(typeof entry.relativeLocation === 'string' && entry.relativeLocation.length > 0,
    `Missing extension location in ${registry} for ${entry.identifier?.id}`);
  return path.resolve(path.dirname(registry), entry.relativeLocation);
}

export function captureInventory(sources, selfId) {
  selfId = normalizeId(selfId);
  requireValue(sources.length > 0, 'Supply at least one --source label=/path/to/extensions.json');
  const labels = new Set();
  const extensions = new Map();
  for (const { label, file } of sources) {
    requireValue(typeof label === 'string' && sourcePattern.test(label) && !labels.has(label),
      `Invalid or duplicate source label: ${label}`);
    labels.add(label);
    const registry = readJson(file);
    requireValue(Array.isArray(registry), `Expected an extension registry array in ${file}`);
    const sourceIds = new Set();
    for (const entry of registry) {
      requireValue(entry && typeof entry === 'object', `Invalid registry entry in ${file}`);
      const id = normalizeId(entry.identifier?.id);
      if (entry.metadata?.isBuiltin === true || id === selfId) continue;
      requireValue(!sourceIds.has(id), `Duplicate extension ${id} in source ${label}`);
      sourceIds.add(id);
      const manifest = readJson(path.join(installedDirectory(entry, file), 'package.json'));
      requireValue(manifest && typeof manifest === 'object', `Invalid manifest for ${id}`);
      requireValue(normalizeId(`${manifest.publisher}.${manifest.name}`) === id,
        `Manifest identity does not match ${id} in source ${label}`);
      requireValue(typeof entry.version === 'string' && entry.version.length > 0
        && entry.version === manifest.version, `Version mismatch or invalid version for ${id} in ${label}`);
      const members = normalizeMembers(manifest.extensionPack === undefined ? [] : manifest.extensionPack, id);
      const existing = extensions.get(id);
      requireValue(!existing || same(existing.extensionPack, members),
        `Conflicting pack membership for ${id} between sources; review the installed versions`);
      const extension = existing ?? { id, installations: [], extensionPack: members };
      extension.installations.push({ source: label, version: entry.version });
      extensions.set(id, extension);
    }
  }
  const snapshot = {
    schemaVersion: 1,
    extensions: [...extensions.values()]
      .sort((left, right) => left.id.localeCompare(right.id, 'en'))
      .map(extension => ({
        ...extension,
        installations: extension.installations.sort((left, right) =>
          left.source.localeCompare(right.source, 'en')),
      })),
  };
  compactEntries(snapshot, selfId);
  return snapshot;
}

export function compactEntries(snapshot, selfId) {
  requireValue(snapshot?.schemaVersion === 1 && Array.isArray(snapshot.extensions),
    'Invalid snapshot: expected schemaVersion 1 and an extensions array');
  requireValue(snapshot.extensions.length > 0, 'Inventory is empty; refusing to create an empty pack');
  const entries = new Map();
  for (const extension of snapshot.extensions) {
    requireValue(extension && typeof extension === 'object', 'Invalid snapshot extension');
    const id = normalizeId(extension.id);
    requireValue(id === extension.id && !entries.has(id), `Duplicate or non-normalized snapshot ID: ${id}`);
    requireValue(id !== selfId, `The pack cannot contain itself: ${id}`);
    const members = normalizeMembers(extension.extensionPack, id);
    requireValue(same(members, extension.extensionPack), `Unsorted or duplicate pack members for ${id}`);
    requireValue(Array.isArray(extension.installations) && extension.installations.length > 0,
      `Missing source/version information for ${id}`);
    const sources = new Set();
    for (const installation of extension.installations) {
      requireValue(installation && typeof installation.source === 'string'
        && sourcePattern.test(installation.source)
        && !sources.has(installation.source)
        && typeof installation.version === 'string' && installation.version.length > 0,
      `Invalid or duplicate installation metadata for ${id}`);
      sources.add(installation.source);
    }
    entries.set(id, members);
  }
  const visiting = new Set();
  const visited = new Set();
  const indirect = new Set();
  function visit(id) {
    requireValue(entries.has(id), `Pack member ${id} is missing from the inventory; install it or review the source`);
    requireValue(!visiting.has(id), `Extension pack cycle detected at ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const member of entries.get(id)) {
      indirect.add(member);
      visit(member);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of entries.keys()) visit(id);
  return [...entries.keys()].filter(id => !indirect.has(id)).sort();
}

function verifyManifest(manifest, snapshot) {
  const selfId = normalizeId(`${manifest.publisher}.${manifest.name}`);
  const direct = compactEntries(snapshot, selfId);
  requireValue(same(manifest.extensionPack, direct),
    'package.json extensionPack does not match compact snapshot coverage; review npm run sync with all sources');
  requireValue(manifest.categories?.includes('Extension Packs'), 'Missing Extension Packs category');
  requireValue(!manifest.main && !manifest.browser && !manifest.activationEvents
    && !manifest.extensionDependencies, 'Expected a declarative pack without runtime or functional dependencies');
  return direct;
}

function updateReadmeInventory(readme, snapshot) {
  const start = '<!-- extension-inventory:start -->';
  const end = '<!-- extension-inventory:end -->';
  requireValue(readme.split(start).length === 2 && readme.split(end).length === 2
    && readme.indexOf(start) < readme.indexOf(end),
  'README.md must contain exactly one ordered pair of extension-inventory markers');
  const parents = new Map();
  for (const extension of snapshot.extensions) {
    for (const member of extension.extensionPack) {
      const containingPacks = parents.get(member) ?? [];
      containingPacks.push(extension.id);
      parents.set(member, containingPacks);
    }
  }
  const link = id => `[${id}](https://marketplace.visualstudio.com/items?itemName=${id})`;
  const rows = snapshot.extensions.map(extension => extension.id).sort().map(id => {
    const containingPacks = parents.get(id);
    const includedThrough = containingPacks
      ? containingPacks.sort().map(link).join(', ')
      : 'Direct entry';
    return `| ${link(id)} | ${includedThrough} |`;
  });
  const section = [
    start,
    '',
    `All **${snapshot.extensions.length} extensions** in the reference inventory:`,
    '',
    '| Extension ID | Included through |',
    '| --- | --- |',
    ...rows,
    '',
    end,
  ].join('\n');
  return readme.slice(0, readme.indexOf(start)) + section
    + readme.slice(readme.indexOf(end) + end.length);
}

function printChanges(previous, next, oldDirect, newDirect, log) {
  const before = new Map((previous?.extensions ?? []).map(extension => [extension.id, extension]));
  const after = new Map(next.extensions.map(extension => [extension.id, extension]));
  for (const id of [...new Set([...before.keys(), ...after.keys()])].sort()) {
    if (!before.has(id)) log(`+ inventory ${id}`);
    else if (!after.has(id)) log(`- inventory ${id}`);
    else if (!same(before.get(id).extensionPack, after.get(id).extensionPack)) {
      log(`~ pack ${id}: ${before.get(id).extensionPack.join(', ')} -> ${after.get(id).extensionPack.join(', ')}`);
    }
    if (before.has(id) && after.has(id)
      && !same(before.get(id).installations, after.get(id).installations)) {
      log(`~ observations ${id}: ${JSON.stringify(before.get(id).installations)} -> ${JSON.stringify(after.get(id).installations)}`);
    }
  }
  for (const id of oldDirect.filter(id => !newDirect.includes(id))) log(`- direct ${id}`);
  for (const id of newDirect.filter(id => !oldDirect.includes(id))) log(`+ direct ${id}`);
}

function writeOutputs(outputs) {
  const staged = [];
  try {
    for (const [file, content] of outputs) {
      if (existsSync(file) && readFileSync(file, 'utf8') === content) continue;
      const temporary = `${file}.${process.pid}.sync-tmp`;
      writeFileSync(temporary, content, { flag: 'wx' });
      staged.push([temporary, file]);
    }
    for (const [temporary, file] of staged) renameSync(temporary, file);
  } finally {
    for (const [temporary] of staged) rmSync(temporary, { force: true });
  }
}

export function run(args, directory = projectDirectory, log = console.log) {
  const sources = [];
  let check = false;
  let write = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--check') check = true;
    else if (arg === '--write') write = true;
    else if (arg === '--source') {
      const value = args[++index];
      const separator = value?.indexOf('=') ?? -1;
      requireValue(separator > 0 && separator < value.length - 1,
        'Expected --source label=/path/to/extensions.json');
      sources.push({ label: value.slice(0, separator), file: path.resolve(value.slice(separator + 1)) });
    } else if (arg === '--help') {
      log('Usage: npm run sync -- --source label=/path/to/extensions.json [--source ...] [--write]');
      log('Preview is the default. Supply ALL selected sources on every update.');
      log('npm run validate checks the saved snapshot without reading installed extensions.');
      return;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  requireValue(!check || (!write && sources.length === 0), '--check cannot be combined with sources or --write');
  const manifestPath = path.join(directory, 'package.json');
  const snapshotPath = path.join(directory, 'extensions.snapshot.json');
  const readmePath = path.join(directory, 'README.md');
  const manifest = readJson(manifestPath);
  const readme = readFileSync(readmePath, 'utf8');
  const selfId = normalizeId(`${manifest.publisher}.${manifest.name}`);
  if (check) {
    const snapshot = readJson(snapshotPath);
    const direct = verifyManifest(manifest, snapshot);
    requireValue(readme === updateReadmeInventory(readme, snapshot),
      'README.md inventory is out of date; review npm run sync with all sources and --write');
    log(`Valid: ${snapshot.extensions.length} inventory entries, ${direct.length} direct, ${snapshot.extensions.length - direct.length} indirect.`);
    return;
  }
  requireValue(Array.isArray(manifest.extensionPack), 'package.json extensionPack must be an array');
  const previous = existsSync(snapshotPath) ? readJson(snapshotPath) : null;
  if (previous) {
    compactEntries(previous, selfId);
    const previousSources = new Set(previous.extensions.flatMap(extension =>
      extension.installations.map(installation => installation.source)));
    const supplied = new Set(sources.map(source => source.label));
    for (const source of previousSources) {
      requireValue(supplied.has(source),
        `Missing previously captured source "${source}"; supply all sources to avoid accidental removal`);
    }
  }
  const snapshot = captureInventory(sources, selfId);
  const direct = compactEntries(snapshot, selfId);
  const updatedManifest = { ...manifest, extensionPack: direct };
  verifyManifest(updatedManifest, snapshot);
  const updatedReadme = updateReadmeInventory(readme, snapshot);
  printChanges(previous, snapshot, manifest.extensionPack, direct, log);
  if (readme !== updatedReadme) log('~ README extension inventory');
  const changed = !same(previous, snapshot) || !same(manifest.extensionPack, direct)
    || readme !== updatedReadme;
  log(`${snapshot.extensions.length} inventory entries, ${direct.length} direct, ${snapshot.extensions.length - direct.length} indirect.`);
  if (write) {
    writeOutputs([
      [snapshotPath, json(snapshot)],
      [manifestPath, json(updatedManifest)],
      [readmePath, updatedReadme],
    ]);
    log(changed ? 'Updated snapshot, pack membership and README inventory.' : 'No changes.');
  } else log(changed ? 'Preview only. Repeat with --write to apply these changes.' : 'No changes. Preview only.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
