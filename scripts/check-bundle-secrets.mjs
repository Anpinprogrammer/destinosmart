#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const assetsDirectory = process.env.BUNDLE_DIR ?? path.join(process.cwd(), 'dist', 'assets');
const forbidden = [
  { label: 'sb_secret_ (valor)', pattern: /sb_secret_[A-Za-z0-9_-]{16,}/ },
  { label: 'SUPABASE_SERVICE_ROLE_KEY', pattern: /SUPABASE_SERVICE_ROLE_KEY/ },
  { label: 'EMAIL_PROVIDER_API_KEY', pattern: /EMAIL_PROVIDER_API_KEY/ },
  { label: 'VITE_SUPABASE_SERVICE_ROLE_KEY', pattern: /VITE_SUPABASE_SERVICE_ROLE_KEY/ },
];
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

const entries = await readdir(assetsDirectory);
const files = entries.filter((entry) => /\.(?:js|css)$/.test(entry));
const violations = [];

for (const file of files) {
  const content = await readFile(path.join(assetsDirectory, file), 'utf8');
  for (const marker of forbidden) {
    if (marker.pattern.test(content)) {
      violations.push(`${file}: ${marker.label}`);
    }
  }

  for (const jwt of content.match(JWT_PATTERN) ?? []) {
    try {
      const payload = JSON.parse(
        Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'),
      );
      if (payload.role === 'service_role') {
        violations.push(`${file}: JWT con rol service_role`);
      }
    } catch {
      // Un JWT truncado o sintético no es un secreto utilizable.
    }
  }
}

if (violations.length > 0) {
  console.error('Posibles secretos en el bundle:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`OK — ${files.length} assets sin secretos server-side`);
