#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../..');

const force = process.argv.includes('--force') || process.env.FORCE === '1';
const openclawHome = process.env.OPENCLAW_HOME || join(homedir(), '.openclaw');
const contentHome = process.env.CONTENT_OS_HOME || join(homedir(), 'Documents', 'openclaw-content-os-data');
const sharedSkillsDir = join(openclawHome, 'skills');
const configPath = join(openclawHome, 'openclaw.json');
const templateConfigPath = join(openclawHome, 'openclaw.content-os.template.json5');

const starterAgents = [
  { id: 'content-boss', role: 'boss', workspace: join(openclawHome, 'workspace-content-os-boss') },
  { id: 'content-material', role: 'material', workspace: join(openclawHome, 'workspace-content-os-material') },
  { id: 'content-creator', role: 'creator', workspace: join(openclawHome, 'workspace-content-os-creator') },
  { id: 'content-thinktank', role: 'thinktank', workspace: join(openclawHome, 'workspace-content-os-thinktank') },
  { id: 'content-tech', role: 'tech', workspace: join(openclawHome, 'workspace-content-os-tech') },
];

function ensureCommand(command) {
  const result = spawnSync(command, ['--help'], { stdio: 'ignore' });
  if (result.error) {
    console.error(`${command} not found. Install it first.`);
    process.exit(1);
  }
}

function runOpenClaw(args, options = {}) {
  const result = spawnSync('openclaw', args, {
    encoding: 'utf8',
    ...options,
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    const stdout = (result.stdout || '').trim();
    throw new Error(stderr || stdout || `openclaw ${args.join(' ')} failed`);
  }

  return (result.stdout || '').trim();
}

function tryOpenClaw(args) {
  const result = spawnSync('openclaw', args, { encoding: 'utf8' });
  if (result.status !== 0) return null;
  return (result.stdout || '').trim();
}

function configGet(path, fallback = undefined) {
  const output = tryOpenClaw(['config', 'get', path, '--json']);
  if (!output) return fallback;
  try {
    return JSON.parse(output);
  } catch {
    return fallback;
  }
}

function configSet(path, value) {
  runOpenClaw(['config', 'set', path, JSON.stringify(value), '--strict-json']);
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function copyIfNeeded(src, dst) {
  ensureDir(dirname(dst));
  if (existsSync(dst) && !force) {
    console.log(`skip: ${dst}`);
    return;
  }
  copyFileSync(src, dst);
  console.log(`copy: ${dst}`);
}

function copyDirContents(srcDir, dstDir) {
  ensureDir(dstDir);
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    const dst = join(dstDir, name);
    const stat = statSync(src);
    if (stat.isDirectory()) {
      copyDirContents(src, dst);
    } else {
      copyIfNeeded(src, dst);
    }
  }
}

function backupConfigIfNeeded() {
  if (!existsSync(configPath)) return false;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${configPath}.bak.${stamp}`;
  copyFileSync(configPath, backupPath);
  console.log(`backup: ${backupPath}`);
  return true;
}

function installWorkspaceTemplates() {
  for (const agent of starterAgents) {
    ensureDir(agent.workspace);
    const srcDir = join(repoRoot, 'templates', 'workspaces', agent.role);
    copyIfNeeded(join(srcDir, 'AGENTS.md'), join(agent.workspace, 'AGENTS.md'));
    copyIfNeeded(join(srcDir, 'SOUL.md'), join(agent.workspace, 'SOUL.md'));
    copyIfNeeded(join(srcDir, 'TOOLS.md'), join(agent.workspace, 'TOOLS.md'));
  }
}

function installContentTemplates() {
  const srcDir = join(repoRoot, 'templates', 'content-system');
  copyDirContents(srcDir, contentHome);
}

function installSkills() {
  const srcDir = join(repoRoot, 'skills');
  ensureDir(sharedSkillsDir);
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    if (!statSync(src).isDirectory()) continue;
    const dst = join(sharedSkillsDir, name);
    copyDirContents(src, dst);
  }
}

function installAgents() {
  const existingAgents = configGet('agents.list', []);
  const existingIds = new Set((existingAgents || []).map((item) => item.id));

  for (const agent of starterAgents) {
    if (existingIds.has(agent.id)) {
      console.log(`skip agent: ${agent.id}`);
      continue;
    }

    const output = runOpenClaw([
      'agents',
      'add',
      agent.id,
      '--workspace',
      agent.workspace,
      '--non-interactive',
      '--json',
    ]);

    console.log(`agent added: ${agent.id}`);
    if (output) {
      try {
        const summary = JSON.parse(output);
        if (summary?.workspace) console.log(`workspace: ${summary.workspace}`);
      } catch {
        // ignore summary parse failure
      }
    }
  }

  return existingAgents;
}

function updateAgentToAgentAccess() {
  const currentAllow = configGet('tools.agentToAgent.allow', []);
  const mergedAllow = Array.from(new Set([...(currentAllow || []), ...starterAgents.map((item) => item.id)]));
  configSet('tools.agentToAgent.enabled', true);
  configSet('tools.agentToAgent.allow', mergedAllow);
}

function maybeSetDefaultBoss(previousAgents) {
  const priorIds = new Set((previousAgents || []).map((item) => item.id));
  const onlyMainBefore = priorIds.size === 1 && priorIds.has('main');
  if (!onlyMainBefore) {
    return false;
  }

  const currentAgents = configGet('agents.list', []);
  const updatedAgents = (currentAgents || []).map((agent) => {
    if (agent.id === 'content-boss') {
      return { ...agent, default: true };
    }
    if (agent.default) {
      const nextAgent = { ...agent };
      delete nextAgent.default;
      return nextAgent;
    }
    return agent;
  });

  configSet('agents.list', updatedAgents);
  return true;
}

function validateConfig() {
  runOpenClaw(['config', 'validate']);
}

function gatewayStatus() {
  const result = spawnSync('openclaw', ['gateway', 'status'], { encoding: 'utf8' });
  return result.status === 0;
}

function printSummary(setDefault) {
  console.log('\nDone.');
  console.log('\nInstalled:');
  console.log('- 5 starter agents');
  console.log('- shared starter skills in ~/.openclaw/skills');
  console.log(`- local content data in ${contentHome}`);
  console.log(`- config template in ${templateConfigPath}`);

  console.log('\nWhat changed automatically:');
  console.log('- copied workspace templates');
  console.log('- copied starter skills');
  console.log('- created starter agents if missing');
  console.log('- enabled tools.agentToAgent and merged allow list');

  if (setDefault) {
    console.log('- set content-boss as the default agent because this looked like a fresh install');
  } else {
    console.log('- kept your existing default-agent behavior unchanged');
  }

  console.log('\nNext step:');
  if (gatewayStatus()) {
    console.log('- Open a NEW session in Control UI and switch to content-boss if needed');
  } else {
    console.log('- Start or restart the gateway: openclaw gateway restart');
  }
  console.log('- Then send: 请按这个 starter 的默认流程，帮我规划一篇内容，从素材整理开始。');

  console.log('\nOptional later:');
  console.log('- Add Telegram or other channels after the local workflow works');
  console.log('- Review the public template at ~/.openclaw/openclaw.content-os.template.json5');
}

ensureCommand('openclaw');
ensureCommand('node');

if (!existsSync(configPath)) {
  console.error('No OpenClaw config found at ~/.openclaw/openclaw.json.');
  console.error('Run `openclaw onboard --install-daemon` first, then run this installer again.');
  process.exit(1);
}

backupConfigIfNeeded();
installWorkspaceTemplates();
installContentTemplates();
installSkills();
copyIfNeeded(join(repoRoot, 'templates', 'openclaw.json5.template'), templateConfigPath);

const previousAgents = installAgents();
updateAgentToAgentAccess();
const setDefault = maybeSetDefaultBoss(previousAgents);
validateConfig();
printSummary(setDefault);
