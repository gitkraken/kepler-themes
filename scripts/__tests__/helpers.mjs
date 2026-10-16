import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { formatJson, plain } from '../lib/gallery.mjs';

export function validFamily(overrides = {}) {
  return {
    schemaVersion: 1,
    name: 'Example',
    version: '1.0.0',
    author: 'Ada',
    description: 'An example.',
    license: 'MIT',
    themes: [{ id: 'example-dark', name: 'Example Dark', extends: 'dark' }],
    ...overrides,
  };
}

/** Writes a gallery under a fresh temp dir: { slug: { family, gallery, extra } }. */
export function makeGallery(families = {}, { featured = [], withdrawn = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'kepler-themes-'));
  mkdirSync(join(root, 'themes'));
  for (const [slug, spec] of Object.entries(families)) {
    const dir = join(root, 'themes', slug);
    mkdirSync(dir);
    const text = (v) => (typeof v === 'string' ? v : formatJson(v));
    writeFileSync(join(dir, `${slug}.json`), text(spec.family ?? validFamily()));
    writeFileSync(join(dir, 'gallery.json'), text(spec.gallery ?? { maintainers: ['ada'], tags: ['blue'] }));
    for (const [name, content] of Object.entries(spec.extra ?? {})) writeFileSync(join(dir, name), content);
  }
  writeFileSync(join(root, 'featured.json'), formatJson(featured));
  writeFileSync(join(root, 'withdrawn.json'), formatJson(withdrawn));
  writeFileSync(join(root, 'tags.json'), formatJson(['blue', 'purple', 'vivid']));
  return root;
}

export function problemsOf(report, slug, name) {
  const family = report.families.find((f) => f.slug === slug);
  return family.checks.find((c) => c.name === name).problems.map(plain);
}

export function globalProblemsOf(report, name) {
  return report.global.find((c) => c.name === name)?.problems.map(plain);
}
