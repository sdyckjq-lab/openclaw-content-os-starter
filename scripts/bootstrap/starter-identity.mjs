import { existsSync } from 'node:fs';
import { join } from 'node:path';

function normalizeSlug(value, fallback) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;

  const normalized = raw
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || fallback;
}

function buildWorkspacePath(openclawHome, workspacePrefix, roleKey) {
  return join(openclawHome, `${workspacePrefix}-${roleKey}`);
}

function buildExpectedStack(openclawHome, agentPrefix, workspacePrefix, roleKeys) {
  return roleKeys.map((roleKey) => ({
    id: `${agentPrefix}-${roleKey}`,
    workspace: buildWorkspacePath(openclawHome, workspacePrefix, roleKey),
  }));
}

function hasCompleteStack(currentAgents, openclawHome, agentPrefix, workspacePrefix, roleKeys) {
  const agentsById = new Map((currentAgents || []).map((agent) => [agent.id, agent]));

  for (const item of buildExpectedStack(openclawHome, agentPrefix, workspacePrefix, roleKeys)) {
    const existing = agentsById.get(item.id);
    if (!existing) return false;
    if ((existing.workspace || '') !== item.workspace) return false;
  }

  return true;
}

function hasCollision(currentAgents, openclawHome, agentPrefix, workspacePrefix, roleKeys) {
  const agentsById = new Map((currentAgents || []).map((agent) => [agent.id, agent]));
  const workspaceOwners = new Map();

  for (const agent of currentAgents || []) {
    if (!agent.workspace) continue;
    workspaceOwners.set(agent.workspace, agent.id);
  }

  for (const item of buildExpectedStack(openclawHome, agentPrefix, workspacePrefix, roleKeys)) {
    if (agentsById.has(item.id)) return true;
    if (workspaceOwners.has(item.workspace)) return true;
    if (existsSync(item.workspace)) return true;
  }

  return false;
}

function resolveRequestedIdentity(requestedAgentPrefix, requestedWorkspacePrefix) {
  const hasAgentPrefix = Boolean(String(requestedAgentPrefix || '').trim());
  const hasWorkspacePrefix = Boolean(String(requestedWorkspacePrefix || '').trim());

  if (!hasAgentPrefix && !hasWorkspacePrefix) return null;

  const normalizedAgentPrefix = hasAgentPrefix
    ? normalizeSlug(requestedAgentPrefix, 'starter')
    : normalizeSlug(String(requestedWorkspacePrefix).replace(/^workspace-/, ''), 'starter');

  const normalizedWorkspacePrefix = hasWorkspacePrefix
    ? normalizeSlug(requestedWorkspacePrefix, `workspace-${normalizedAgentPrefix}`)
    : `workspace-${normalizedAgentPrefix}`;

  return {
    agentPrefix: normalizedAgentPrefix,
    workspacePrefix: normalizedWorkspacePrefix,
    mode: 'requested',
  };
}

function resolveAutomaticIdentity({ currentAgents, openclawHome, roleKeys, presetDefaultAgentPrefix, presetDefaultWorkspacePrefix }) {
  if (hasCompleteStack(currentAgents, openclawHome, 'starter', 'workspace-starter', roleKeys)) {
    return {
      agentPrefix: 'starter',
      workspacePrefix: 'workspace-starter',
      mode: 'detected-existing',
    };
  }

  if (hasCompleteStack(currentAgents, openclawHome, presetDefaultAgentPrefix, presetDefaultWorkspacePrefix, roleKeys)) {
    return {
      agentPrefix: presetDefaultAgentPrefix,
      workspacePrefix: presetDefaultWorkspacePrefix,
      mode: 'detected-existing',
    };
  }

  let attempt = 1;
  while (true) {
    const suffix = attempt === 1 ? '' : `-${attempt}`;
    const candidateAgentPrefix = `starter${suffix}`;
    const candidateWorkspacePrefix = `workspace-starter${suffix}`;
    if (!hasCollision(currentAgents, openclawHome, candidateAgentPrefix, candidateWorkspacePrefix, roleKeys)) {
      return {
        agentPrefix: candidateAgentPrefix,
        workspacePrefix: candidateWorkspacePrefix,
        mode: 'automatic',
      };
    }
    attempt += 1;
  }
}

function resolveStarterIdentity({
  requestedAgentPrefix,
  requestedWorkspacePrefix,
  storedManifest,
  currentAgents,
  openclawHome,
  roleKeys,
  presetDefaultAgentPrefix,
  presetDefaultWorkspacePrefix,
}) {
  const requestedIdentity = resolveRequestedIdentity(requestedAgentPrefix, requestedWorkspacePrefix);
  if (requestedIdentity) {
    return requestedIdentity;
  }

  if (storedManifest?.agentPrefix && storedManifest?.workspacePrefix) {
    return {
      agentPrefix: normalizeSlug(storedManifest.agentPrefix, 'starter'),
      workspacePrefix: normalizeSlug(storedManifest.workspacePrefix, 'workspace-starter'),
      mode: 'stored',
    };
  }

  return resolveAutomaticIdentity({
    currentAgents,
    openclawHome,
    roleKeys,
    presetDefaultAgentPrefix,
    presetDefaultWorkspacePrefix,
  });
}

export { resolveStarterIdentity };
