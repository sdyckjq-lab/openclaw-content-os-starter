import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTemplateConfig, loadPresetDefinition, resolveStarterManifest } from './starter-manifest.mjs';

test('loads content-basic preset definition', () => {
  const preset = loadPresetDefinition('content-basic');

  assert.equal(preset.key, 'content-basic');
  assert.equal(preset.roles.length, 5);
  assert.deepEqual(
    preset.roles.map((role) => role.key),
    ['boss', 'material', 'creator', 'thinktank', 'tech'],
  );
  assert.deepEqual(preset.sharedSkills, [
    'x-article-extractor',
    'update-material-index',
    'material-recommendation',
    'record-inspiration',
    'deepen-topic',
    'generate-draft',
  ]);
});

test('loads preset-template skeleton definition', () => {
  const preset = loadPresetDefinition('preset-template');

  assert.equal(preset.key, 'preset-template');
  assert.equal(preset.roles.length, 2);
  assert.deepEqual(
    preset.roles.map((role) => role.key),
    ['boss', 'specialist'],
  );
  assert.deepEqual(preset.sharedSkills, []);
});

test('resolves manifest from content-basic preset with overrides', () => {
  const manifest = resolveStarterManifest({
    openclawHome: '/tmp/openclaw-home',
    presetKey: 'content-basic',
    agentPrefix: 'Client Team',
    workspacePrefix: 'workspace Client Team',
  });

  assert.equal(manifest.presetKey, 'content-basic');
  assert.equal(manifest.bossId, 'client-team-boss');
  assert.equal(manifest.agentPrefix, 'client-team');
  assert.equal(manifest.workspacePrefix, 'workspace-client-team');
  assert.equal(manifest.agents[2].id, 'client-team-creator');
  assert.equal(manifest.agents[2].workspace, '/tmp/openclaw-home/workspace-client-team-creator');
  assert.deepEqual(manifest.sharedSkills, [
    'x-article-extractor',
    'update-material-index',
    'material-recommendation',
    'record-inspiration',
    'deepen-topic',
    'generate-draft',
  ]);
});

test('builds template config from preset manifest', () => {
  const manifest = resolveStarterManifest({
    openclawHome: '/tmp/openclaw-home',
    presetKey: 'content-basic',
  });

  const template = buildTemplateConfig(manifest);

  assert.match(template, /preset: content-basic/);
  assert.match(template, /content-boss/);
  assert.match(template, /content-thinktank/);
  assert.match(template, /"content-tech"/);
});

test('falls back to stored manifest when preset file is unavailable', () => {
  const manifest = resolveStarterManifest({
    openclawHome: '/tmp/openclaw-home',
    storedManifest: {
      version: 2,
      presetKey: 'missing-preset',
      presetLabel: 'Missing Preset',
      presetDescription: 'Stored fallback preset',
      agentPrefix: 'stored',
      workspacePrefix: 'workspace-stored',
      bossRole: 'boss',
      bossId: 'stored-boss',
      sharedSkills: ['stored-skill'],
      agents: [
        {
          id: 'stored-boss',
          role: 'boss',
          label: 'Boss',
          workspaceTemplate: 'boss',
          recommendedSkills: ['stored-skill'],
          workspace: '/tmp/openclaw-home/workspace-stored-boss'
        }
      ]
    }
  });

  assert.equal(manifest.presetKey, 'missing-preset');
  assert.deepEqual(manifest.sharedSkills, ['stored-skill']);
  assert.equal(manifest.agents[0].workspace, '/tmp/openclaw-home/workspace-stored-boss');
});
