#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const BASELINE = path.join(
  ROOT,
  'tests/regression/protected-files.baseline.json',
);
const PROTOTYPE_REFERENCE = 'prototipos';
const PROTOTYPE_BASELINE = path.join(
  ROOT,
  'tests/regression/prototype-reference.baseline.json',
);
const PRODUCTION_BASELINE = path.join(
  ROOT,
  'tests/regression/production-files.baseline.json',
);
const PRODUCTION_PROTECTED = [
  '.github/workflows',
  '.gitignore',
  'package.json',
  'package-lock.json',
  'index.html',
  'vite.config.ts',
  'vitest.config.ts',
  'playwright.config.ts',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'vercel.json',
  'scripts/check-protected-files.mjs',
  'scripts/check-bundle-secrets.mjs',
  'scripts/validate-env.ts',
  'src/main.tsx',
  'src/router.tsx',
  'src/index.css',
  'src/vite-env.d.ts',
  'src/lib',
  'src/routes',
  'src/components',
  'src/features/auth',
  'src/features/profile',
  'src/features/landing',
  'src/features/dashboard',
  'public/assets',
];
const PROTECTED = [
  'AGENTS.md',
  'README.md',
  'docs/DESIGN_SYSTEM.md',
  'docs/constitution.md',
  'docs/decisions',
  'docs/tech-stack.md',
  'docs/project-brief.md',
  'docs/open-questions.md',
  'docs/current-architecture-audit.md',
  'docs/operations',
  'specs/core',
  'specs/features/02-authentication/spec.md',
  'specs/features/02-authentication/plan.md',
  'specs/features/02-authentication/clarifications.md',
  'specs/features/02-authentication/contracts',
  'specs/README.md',
  'specs/_templates',
];
const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', 'dist', '.vite']);
const IGNORED_FILES = new Set(['.DS_Store']);
const IGNORED_EXTENSIONS = new Set(['.tsbuildinfo']);

async function walk(absolutePath, relativePath, files) {
  const info = await stat(absolutePath);
  if (info.isDirectory()) {
    const entries = (await readdir(absolutePath)).sort();
    for (const entry of entries) {
      if (IGNORED_DIRECTORIES.has(entry)) {
        continue;
      }
      await walk(
        path.join(absolutePath, entry),
        path.posix.join(relativePath, entry),
        files,
      );
    }
    return;
  }

  if (
    IGNORED_FILES.has(path.basename(absolutePath)) ||
    IGNORED_EXTENSIONS.has(path.extname(absolutePath))
  ) {
    return;
  }

  const hash = createHash('sha256')
    .update(await readFile(absolutePath))
    .digest('hex');
  files[relativePath] = hash;
}

export async function computeManifest(paths = PROTECTED) {
  const files = {};
  for (const protectedPath of paths) {
    const absolute = path.join(ROOT, protectedPath);
    try {
      await walk(absolute, protectedPath, files);
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }
  return { algorithm: 'sha256', files };
}

export async function computePrototypeManifest() {
  return computeManifest([PROTOTYPE_REFERENCE]);
}

export async function computeProductionManifest() {
  return computeManifest(PRODUCTION_PROTECTED);
}

async function readBaseline(file = BASELINE) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function diffManifests(expected, actual) {
  const changes = [];
  const keys = new Set([
    ...Object.keys(expected.files),
    ...Object.keys(actual.files),
  ]);
  for (const key of [...keys].sort()) {
    if (!(key in actual.files)) {
      changes.push(`eliminado: ${key}`);
    } else if (!(key in expected.files)) {
      changes.push(`nuevo: ${key}`);
    } else if (expected.files[key] !== actual.files[key]) {
      changes.push(`modificado: ${key}`);
    }
  }
  return changes;
}

const write = process.argv.includes('--write');
const writePrototype = process.argv.includes('--write-prototype');
const writeProduction = process.argv.includes('--write-production');
const manifest = await computeManifest();
const prototypeManifest = await computePrototypeManifest();
const productionManifest = await computeProductionManifest();

if (write || writePrototype || writeProduction) {
  if (write) {
    await writeFile(BASELINE, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Baseline protegido escrito: ${path.relative(ROOT, BASELINE)}`);
  }
  if (writePrototype) {
    await writeFile(
      PROTOTYPE_BASELINE,
      `${JSON.stringify(prototypeManifest, null, 2)}\n`,
    );
    console.log(
      `Baseline de referencia del prototipo escrito: ${path.relative(ROOT, PROTOTYPE_BASELINE)}`,
    );
  }
  if (writeProduction) {
    await writeFile(
      PRODUCTION_BASELINE,
      `${JSON.stringify(productionManifest, null, 2)}\n`,
    );
    console.log(
      `Baseline de producción escrito: ${path.relative(ROOT, PRODUCTION_BASELINE)}`,
    );
  }
  process.exit(0);
}

const baseline = await readBaseline();
const prototypeBaseline = await readBaseline(PROTOTYPE_BASELINE);
const productionBaseline = await readBaseline(PRODUCTION_BASELINE);
const changes = [
  ...diffManifests(baseline, manifest).map(
    (change) => `infraestructura/gobernanza — ${change}`,
  ),
  ...diffManifests(prototypeBaseline, prototypeManifest).map(
    (change) => `prototipo de referencia — ${change}`,
  ),
  ...diffManifests(productionBaseline, productionManifest).map(
    (change) => `producción — ${change}`,
  ),
];
if (changes.length > 0) {
  console.error('Cambios en archivos protegidos:');
  for (const change of changes) {
    console.error(`- ${change}`);
  }
  process.exit(1);
}

console.log(
  `OK — ${Object.keys(manifest.files).length} archivos protegidos sin cambios, ${Object.keys(prototypeManifest.files).length} de referencia del prototipo sin cambios y ${Object.keys(productionManifest.files).length} de producción sin cambios`,
);
