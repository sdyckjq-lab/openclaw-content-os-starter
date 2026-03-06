#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';

const openclawHome = process.env.OPENCLAW_HOME || join(homedir(), '.openclaw');
const contentHome = process.env.CONTENT_OS_HOME || join(homedir(), 'Documents', 'openclaw-content-os-data');
const sharedSkillsDir = join(openclawHome, 'skills');
const configPath = join(openclawHome, 'openclaw.json');
const templateConfigPath = join(openclawHome, 'openclaw.content-os.template.json5');

const starterAgents = [
  { id: 'content-boss', role: 'boss' },
  { id: 'content-material', role: 'material' },
  { id: 'content-creator', role: 'creator' },
  { id: 'content-thinktank', role: 'thinktank' },
  { id: 'content-tech', role: 'tech' },
];

const starterSkills = [
  'x-article-extractor',
  'update-material-index',
  'material-recommendation',
  'record-inspiration',
  'deepen-topic',
  'generate-draft',
];

const contentPaths = [
  join(contentHome, 'materials'),
  join(contentHome, 'materials', 'index.md'),
  join(contentHome, 'ideas', 'ideas.md'),
  join(contentHome, 'outlines'),
  join(contentHome, 'drafts'),
  join(contentHome, 'published'),
  join(contentHome, 'config', 'style-guide.md'),
];

let failures = 0;
let warnings = 0;

function printLine(level, message) {
  if (level === 'FAIL') failures += 1;
  if (level === 'WARN') warnings += 1;
  console.log(`[${level}] ${message}`);
}

function runOpenClaw(args) {
  return spawnSync('openclaw', args, { encoding: 'utf8' });
}

function configGet(path, fallback = undefined) {
  const result = runOpenClaw(['config', 'get', path, '--json']);
  if (result.status !== 0) return fallback;
  try {
    return JSON.parse(result.stdout || 'null');
  } catch {
    return fallback;
  }
}

function checkExists(path, label) {
  if (existsSync(path)) {
    printLine('OK', `${label}: ${path}`);
    return true;
  }
  printLine('FAIL', `${label} missing: ${path}`);
  return false;
}

const help = runOpenClaw(['--help']);
if (help.error) {
  printLine('FAIL', 'openclaw CLI not found');
  process.exit(1);
}

printLine('OK', 'openclaw CLI found');

checkExists(configPath, 'config file');
checkExists(templateConfigPath, 'starter template config');

const validate = runOpenClaw(['config', 'validate']);
if (validate.status === 0) {
  printLine('OK', 'config validation passed');
} else {
  printLine('FAIL', 'config validation failed');
}

const agents = configGet('agents.list', []);
const agentIds = new Set((agents || []).map((agent) => agent.id));
for (const agent of starterAgents) {
  if (agentIds.has(agent.id)) {
    printLine('OK', `agent registered: ${agent.id}`);
  } else {
    printLine('FAIL', `agent missing from config: ${agent.id}`);
  }

  const workspace = join(openclawHome, `workspace-content-os-${agent.role}`);
  checkExists(workspace, `workspace for ${agent.id}`);
  checkExists(join(workspace, 'AGENTS.md'), `${agent.id} AGENTS.md`);
  checkExists(join(workspace, 'SOUL.md'), `${agent.id} SOUL.md`);
  checkExists(join(workspace, 'TOOLS.md'), `${agent.id} TOOLS.md`);
}

const agentToAgentEnabled = configGet('tools.agentToAgent.enabled', false);
if (agentToAgentEnabled) {
  printLine('OK', 'agent-to-agent routing enabled');
} else {
  printLine('FAIL', 'agent-to-agent routing disabled');
}

const allowedAgents = new Set(configGet('tools.agentToAgent.allow', []));
for (const agent of starterAgents) {
  if (allowedAgents.has(agent.id)) {
    printLine('OK', `agent-to-agent allowlist includes ${agent.id}`);
  } else {
    printLine('FAIL', `agent-to-agent allowlist missing ${agent.id}`);
  }
}

for (const path of contentPaths) {
  checkExists(path, 'content path');
}

for (const skill of starterSkills) {
  checkExists(join(sharedSkillsDir, skill, 'SKILL.md'), `shared skill ${skill}`);
}

const defaultAgent = (agents || []).find((agent) => agent.default)?.id || '';
if (defaultAgent === 'content-boss') {
  printLine('OK', 'default starter entry is content-boss');
} else if (defaultAgent) {
  printLine('WARN', `default agent is ${defaultAgent}; starter still works, but beginners should start with content-boss`);
} else {
  printLine('WARN', 'no explicit default agent found; start with content-boss manually');
}

const modelStatus = runOpenClaw(['models', 'status', '--plain']);
if (modelStatus.status === 0 && (modelStatus.stdout || '').trim()) {
  printLine('OK', `default model: ${(modelStatus.stdout || '').trim()}`);
} else {
  printLine('WARN', 'default model not resolved; re-run install with a valid provider/key if chats fail');
}

const gateway = runOpenClaw(['gateway', 'status']);
if (gateway.status === 0) {
  printLine('OK', 'gateway is running');
} else {
  printLine('WARN', 'gateway is not running; run: openclaw gateway restart');
}

console.log('');
console.log(`Summary: ${failures} failed, ${warnings} warning(s).`);

if (failures > 0) {
  console.log('Fix the failed items first, then run this check again.');
  process.exit(1);
}

if (warnings > 0) {
  console.log('Starter is usable, but you should review the warnings above.');
} else {
  console.log('Starter looks ready. Next step: openclaw dashboard');
}
