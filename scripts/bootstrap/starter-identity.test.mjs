import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveStarterIdentity } from './starter-identity.mjs';

const roleKeys = ['boss', 'material', 'creator', 'thinktank', 'tech'];

test('uses starter prefixes by default when nothing exists', () => {
  const identity = resolveStarterIdentity({
    requestedAgentPrefix: '',
    requestedWorkspacePrefix: '',
    storedManifest: null,
    currentAgents: [],
    openclawHome: '/tmp/openclaw-home',
    roleKeys,
    presetDefaultAgentPrefix: 'content',
    presetDefaultWorkspacePrefix: 'workspace-content-os',
  });

  assert.equal(identity.agentPrefix, 'starter');
  assert.equal(identity.workspacePrefix, 'workspace-starter');
  assert.equal(identity.mode, 'automatic');
});

test('reuses legacy content stack when it already exists', () => {
  const identity = resolveStarterIdentity({
    requestedAgentPrefix: '',
    requestedWorkspacePrefix: '',
    storedManifest: null,
    currentAgents: roleKeys.map((role) => ({
      id: `content-${role}`,
      workspace: `/tmp/openclaw-home/workspace-content-os-${role}`,
    })),
    openclawHome: '/tmp/openclaw-home',
    roleKeys,
    presetDefaultAgentPrefix: 'content',
    presetDefaultWorkspacePrefix: 'workspace-content-os',
  });

  assert.equal(identity.agentPrefix, 'content');
  assert.equal(identity.workspacePrefix, 'workspace-content-os');
  assert.equal(identity.mode, 'detected-existing');
});

test('increments starter prefixes when default starter names partially collide', () => {
  const identity = resolveStarterIdentity({
    requestedAgentPrefix: '',
    requestedWorkspacePrefix: '',
    storedManifest: null,
    currentAgents: [
      {
        id: 'starter-boss',
        workspace: '/tmp/openclaw-home/workspace-starter-boss',
      },
    ],
    openclawHome: '/tmp/openclaw-home',
    roleKeys,
    presetDefaultAgentPrefix: 'content',
    presetDefaultWorkspacePrefix: 'workspace-content-os',
  });

  assert.equal(identity.agentPrefix, 'starter-2');
  assert.equal(identity.workspacePrefix, 'workspace-starter-2');
  assert.equal(identity.mode, 'automatic');
});

test('derives workspace prefix from explicit agent prefix', () => {
  const identity = resolveStarterIdentity({
    requestedAgentPrefix: 'Acme Team',
    requestedWorkspacePrefix: '',
    storedManifest: null,
    currentAgents: [],
    openclawHome: '/tmp/openclaw-home',
    roleKeys,
    presetDefaultAgentPrefix: 'content',
    presetDefaultWorkspacePrefix: 'workspace-content-os',
  });

  assert.equal(identity.agentPrefix, 'acme-team');
  assert.equal(identity.workspacePrefix, 'workspace-acme-team');
  assert.equal(identity.mode, 'requested');
});

test('keeps stored manifest identity when present', () => {
  const identity = resolveStarterIdentity({
    requestedAgentPrefix: '',
    requestedWorkspacePrefix: '',
    storedManifest: {
      agentPrefix: 'stored-client',
      workspacePrefix: 'workspace-stored-client',
    },
    currentAgents: [],
    openclawHome: '/tmp/openclaw-home',
    roleKeys,
    presetDefaultAgentPrefix: 'content',
    presetDefaultWorkspacePrefix: 'workspace-content-os',
  });

  assert.equal(identity.agentPrefix, 'stored-client');
  assert.equal(identity.workspacePrefix, 'workspace-stored-client');
  assert.equal(identity.mode, 'stored');
});
