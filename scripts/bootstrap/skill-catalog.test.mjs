import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveStarterManifest } from './starter-manifest.mjs';
import { collectPresetSkillIds, loadSkillCatalog, validatePresetSkillsAgainstCatalog } from './skill-catalog.mjs';

test('loads built-in trusted skill catalog entries', () => {
  const catalog = loadSkillCatalog();
  const xSkill = catalog.skills.find((skill) => skill.slug === 'x-article-extractor');

  assert.equal(catalog.version, 1);
  assert.ok(xSkill);
  assert.equal(xSkill.source.type, 'built-in');
  assert.equal(xSkill.trust, 'trusted');
});

test('collects required skills from content-basic preset', () => {
  const manifest = resolveStarterManifest({
    openclawHome: '/tmp/openclaw-home',
    presetKey: 'content-basic',
  });

  assert.deepEqual(collectPresetSkillIds(manifest), [
    'x-article-extractor',
    'update-material-index',
    'material-recommendation',
    'record-inspiration',
    'deepen-topic',
    'generate-draft',
  ]);
});

test('collects no required skills from preset-template skeleton', () => {
  const manifest = resolveStarterManifest({
    openclawHome: '/tmp/openclaw-home',
    presetKey: 'preset-template',
  });

  assert.deepEqual(collectPresetSkillIds(manifest), []);
});

test('validates content-basic preset skills against catalog', () => {
  const catalog = loadSkillCatalog();
  const manifest = resolveStarterManifest({
    openclawHome: '/tmp/openclaw-home',
    presetKey: 'content-basic',
  });

  assert.deepEqual(validatePresetSkillsAgainstCatalog(manifest, catalog), []);
});
