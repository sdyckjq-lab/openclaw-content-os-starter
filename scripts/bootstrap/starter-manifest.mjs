import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTelegramAccountId, buildTelegramEnvName } from './telegram-channel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../..');
const presetsDir = join(repoRoot, 'presets');

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

function humanizeSlug(value) {
  return normalizeSlug(value, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function readJsonFile(filePath) {
  if (!existsSync(filePath)) return null;

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function normalizeRoleDefinition(role) {
  const roleKey = normalizeSlug(role?.key || role?.role || '', '');
  if (!roleKey) {
    throw new Error('Preset role is missing a valid key.');
  }

  const recommendedSkills = Array.isArray(role?.recommendedSkills)
    ? role.recommendedSkills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];

  return {
    key: roleKey,
    label: String(role?.label || humanizeSlug(roleKey)),
    workspaceTemplate: normalizeSlug(role?.workspaceTemplate || roleKey, roleKey),
    recommendedSkills,
  };
}

function normalizePresetDefinition(preset) {
  const presetKey = normalizeSlug(preset?.key, '');
  if (!presetKey) {
    throw new Error('Preset is missing a valid key.');
  }

  const roles = Array.isArray(preset?.roles) ? preset.roles.map(normalizeRoleDefinition) : [];
  if (roles.length === 0) {
    throw new Error(`Preset ${presetKey} has no roles.`);
  }

  const sharedSkills = Array.isArray(preset?.sharedSkills)
    ? preset.sharedSkills.map((skill) => String(skill).trim()).filter(Boolean)
    : [];

  const bossRole = normalizeSlug(preset?.bossRole || 'boss', 'boss');
  const roleKeys = new Set(roles.map((role) => role.key));
  if (!roleKeys.has(bossRole)) {
    throw new Error(`Preset ${presetKey} is missing boss role ${bossRole}.`);
  }

  return {
    key: presetKey,
    label: String(preset?.label || humanizeSlug(presetKey)),
    description: String(preset?.description || ''),
    agentPrefix: normalizeSlug(preset?.agentPrefix || '', 'content'),
    workspacePrefix: normalizeSlug(preset?.workspacePrefix || '', 'workspace-content-os'),
    bossRole,
    roles,
    sharedSkills,
  };
}

function getPresetPath(presetKey) {
  return join(presetsDir, `${presetKey}.json`);
}

function loadPresetDefinition(presetKey = 'content-basic') {
  const normalizedPresetKey = normalizeSlug(presetKey, 'content-basic');
  const presetPath = getPresetPath(normalizedPresetKey);
  const parsed = readJsonFile(presetPath);

  if (!parsed) {
    throw new Error(`Preset not found or invalid JSON: ${presetPath}`);
  }

  return normalizePresetDefinition(parsed);
}

function buildStarterAgents(openclawHome, preset, agentPrefix, workspacePrefix) {
  return preset.roles.map((role) => ({
    id: `${agentPrefix}-${role.key}`,
    role: role.key,
    label: role.label,
    workspaceTemplate: role.workspaceTemplate,
    recommendedSkills: role.recommendedSkills,
    workspace: join(openclawHome, `${workspacePrefix}-${role.key}`),
  }));
}

function readStarterManifest(manifestPath) {
  return readJsonFile(manifestPath);
}

function resolveManifestFromStoredManifest(openclawHome, storedManifest) {
  const resolvedAgentPrefix = normalizeSlug(storedManifest?.agentPrefix || '', 'content');
  const resolvedWorkspacePrefix = normalizeSlug(storedManifest?.workspacePrefix || '', 'workspace-content-os');
  const roles = Array.isArray(storedManifest?.agents)
    ? storedManifest.agents.map((agent) => normalizeRoleDefinition({
      key: agent.role,
      label: agent.label,
      workspaceTemplate: agent.workspaceTemplate,
      recommendedSkills: agent.recommendedSkills,
    }))
    : [];

  if (roles.length === 0) {
    throw new Error('Stored starter manifest has no agents to recover from.');
  }

  const agents = buildStarterAgents(
    openclawHome,
    {
      roles,
    },
    resolvedAgentPrefix,
    resolvedWorkspacePrefix,
  );

  const bossRole = normalizeSlug(storedManifest?.bossRole || 'boss', 'boss');

  return {
    version: Number(storedManifest?.version || 2),
    presetKey: normalizeSlug(storedManifest?.presetKey || 'content-basic', 'content-basic'),
    presetLabel: String(storedManifest?.presetLabel || humanizeSlug(storedManifest?.presetKey || 'content-basic')),
    presetDescription: String(storedManifest?.presetDescription || ''),
    agentPrefix: resolvedAgentPrefix,
    workspacePrefix: resolvedWorkspacePrefix,
    bossRole,
    bossId: `${resolvedAgentPrefix}-${bossRole}`,
    sharedSkills: Array.isArray(storedManifest?.sharedSkills)
      ? storedManifest.sharedSkills.map((skill) => String(skill).trim()).filter(Boolean)
      : [],
    agents,
  };
}

function resolveStarterManifest({
  openclawHome,
  presetKey = '',
  agentPrefix = '',
  workspacePrefix = '',
  storedManifest = null,
}) {
  const resolvedPresetKey = normalizeSlug(presetKey || storedManifest?.presetKey || '', 'content-basic');
  let preset;

  try {
    preset = loadPresetDefinition(resolvedPresetKey);
  } catch (error) {
    const storedPresetKey = normalizeSlug(storedManifest?.presetKey || '', '');
    const canReuseStoredManifest = Array.isArray(storedManifest?.agents)
      && storedManifest.agents.length > 0
      && (!presetKey || resolvedPresetKey === storedPresetKey);

    if (!canReuseStoredManifest) {
      throw error;
    }

    return resolveManifestFromStoredManifest(openclawHome, storedManifest);
  }

  const resolvedAgentPrefix = normalizeSlug(agentPrefix || storedManifest?.agentPrefix || preset.agentPrefix || '', preset.agentPrefix);
  const resolvedWorkspacePrefix = normalizeSlug(
    workspacePrefix || storedManifest?.workspacePrefix || preset.workspacePrefix || '',
    preset.workspacePrefix,
  );
  const agents = buildStarterAgents(openclawHome, preset, resolvedAgentPrefix, resolvedWorkspacePrefix);
  const bossRole = normalizeSlug(storedManifest?.bossRole || preset.bossRole || 'boss', 'boss');

  return {
    version: 2,
    presetKey: preset.key,
    presetLabel: preset.label,
    presetDescription: preset.description,
    agentPrefix: resolvedAgentPrefix,
    workspacePrefix: resolvedWorkspacePrefix,
    bossRole,
    bossId: `${resolvedAgentPrefix}-${bossRole}`,
    sharedSkills: preset.sharedSkills,
    agents,
  };
}

function expandHomePath(path) {
  if (typeof path !== 'string' || !path) return '';
  if (path === '~') return homedir();
  if (path.startsWith('~/')) return join(homedir(), path.slice(2));
  return path;
}

function buildTemplateConfig(starterManifest) {
  const prefixLabel = humanizeSlug(starterManifest.agentPrefix) || humanizeSlug(starterManifest.presetKey) || 'Starter';
  const telegramAccountId = buildTelegramAccountId(starterManifest.agentPrefix);
  const telegramEnvName = buildTelegramEnvName(starterManifest.agentPrefix);
  const lines = [
    '// Copy only the sections you need into ~/.openclaw/openclaw.json.',
    '// This file is generated from your current starter install settings.',
    `// preset: ${starterManifest.presetKey}`,
    '// Beginner default: let all starter agents share the same default model.',
    '// Advanced users can override models per agent with agents.list[].model.',
    '',
    '{',
    '  // Example of one shared default model for all starter agents:',
    '  // agents: {',
    '  //   defaults: {',
    '  //     model: { primary: "openai/gpt-5.2" },',
    '  //   },',
    '  // },',
    '',
    '  agents: {',
    '    list: [',
  ];

  for (const [index, agent] of starterManifest.agents.entries()) {
    const roleLabel = agent.label || humanizeSlug(agent.role);
    lines.push('      {');
    lines.push(`        id: "${agent.id}",`);
    if (agent.id === starterManifest.bossId) {
      lines.push('        default: true,');
    }
    lines.push(`        name: "${prefixLabel} ${roleLabel}",`);
    lines.push(`        workspace: "~/.openclaw/${starterManifest.workspacePrefix}-${agent.role}",`);
    lines.push(`        agentDir: "~/.openclaw/agents/${agent.id}/agent",`);
    if (agent.id === starterManifest.bossId) {
      lines.push('        // Optional model override:');
      lines.push('        // model: { primary: "your-provider/your-model" },');
    }
    lines.push(index === starterManifest.agents.length - 1 ? '      }' : '      },');
  }

  lines.push('    ],');
  lines.push('  },');
  lines.push('');
  lines.push('  tools: {');
  lines.push('    agentToAgent: {');
  lines.push('      enabled: true,');
  lines.push('      allow: [');
  for (const [index, agent] of starterManifest.agents.entries()) {
    const suffix = index === starterManifest.agents.length - 1 ? '' : ',';
    lines.push(`        "${agent.id}"${suffix}`);
  }
  lines.push('      ],');
  lines.push('    },');
  lines.push('  },');
  lines.push('');
  lines.push('  // Optional: route one channel account to the boss only.');
  lines.push('  // Start without this if you are a beginner.');
  lines.push('  // bindings: [');
  lines.push('  //   {');
  lines.push(`  //     agentId: "${starterManifest.bossId}",`);
  lines.push(`  //     match: { channel: "telegram", accountId: "${telegramAccountId}" },`);
  lines.push('  //   },');
  lines.push('  // ],');
  lines.push('  // channels: {');
  lines.push('  //   telegram: {');
  lines.push('  //     accounts: {');
  lines.push(`  //       "${telegramAccountId}": {`);
  lines.push(`  //         botToken: "\${${telegramEnvName}}",`);
  lines.push('  //         dmPolicy: "pairing",');
  lines.push('  //       },');
  lines.push('  //     },');
  lines.push('  //   },');
  lines.push('  // },');
  lines.push('}');

  return `${lines.join('\n')}\n`;
}

export { buildTemplateConfig, expandHomePath, loadPresetDefinition, readStarterManifest, resolveStarterManifest };
