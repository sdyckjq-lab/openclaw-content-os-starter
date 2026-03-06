#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../..');

const force = process.argv.includes('--force') || process.env.FORCE === '1';
const openclawHome = process.env.OPENCLAW_HOME || join(homedir(), '.openclaw');
const contentHome = process.env.CONTENT_OS_HOME || join(homedir(), 'Documents', 'openclaw-content-os-data');
const sharedSkillsDir = join(openclawHome, 'skills');
const configPath = join(openclawHome, 'openclaw.json');
const globalEnvPath = join(openclawHome, '.env');
const templateConfigPath = join(openclawHome, 'openclaw.content-os.template.json5');
const localStarterRoot = join(openclawHome, 'content-os-starter');
const requestedProvider = normalizeProviderChoice(getArgValue('--provider') || process.env.OPENCLAW_CONTENT_OS_PROVIDER || '');
const requestedModel = getArgValue('--model') || process.env.OPENCLAW_CONTENT_OS_MODEL || '';
const requestedApiKey = getArgValue('--api-key') || '';
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

const providerChoices = {
  openai: {
    key: 'openai',
    label: 'OpenAI',
    authChoice: 'openai-api-key',
    envName: 'OPENAI_API_KEY',
    exampleModel: 'openai/gpt-5.2',
  },
  anthropic: {
    key: 'anthropic',
    label: 'Anthropic',
    authChoice: 'anthropic-api-key',
    envName: 'ANTHROPIC_API_KEY',
    exampleModel: 'anthropic/claude-sonnet-4-5',
  },
  gemini: {
    key: 'gemini',
    label: 'Google Gemini',
    authChoice: 'gemini-api-key',
    envName: 'GEMINI_API_KEY',
    exampleModel: 'google/gemini-3-pro-preview',
    aliases: ['google'],
  },
  openrouter: {
    key: 'openrouter',
    label: 'OpenRouter',
    authChoice: 'openrouter-api-key',
    envName: 'OPENROUTER_API_KEY',
    exampleModel: 'openrouter/openai/gpt-4.1-mini',
  },
};

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

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return '';
  return process.argv[index + 1] || '';
}

function normalizeProviderChoice(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  for (const provider of Object.values(providerChoices)) {
    if (provider.key === normalized) return provider.key;
    if ((provider.aliases || []).includes(normalized)) return provider.key;
  }
  return normalized;
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

async function promptText(message) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(message);
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function promptSecret(message) {
  if (!interactive) return '';

  process.stdout.write(message);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  return await new Promise((resolve, reject) => {
    let value = '';

    function cleanup() {
      process.stdin.removeListener('data', onData);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdin.pause();
    }

    function onData(chunk) {
      const char = String(chunk);

      if (char === '\u0003') {
        cleanup();
        reject(new Error('Installation cancelled by user.'));
        return;
      }

      if (char === '\r' || char === '\n') {
        process.stdout.write('\n');
        cleanup();
        resolve(value.trim());
        return;
      }

      if (char === '\u007f') {
        value = value.slice(0, -1);
        return;
      }

      value += char;
    }

    process.stdin.on('data', onData);
  });
}

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function upsertEnvValue(envName, envValue) {
  ensureDir(openclawHome);
  const nextLine = `${envName}=${envValue}`;
  const current = existsSync(globalEnvPath) ? readFileSync(globalEnvPath, 'utf8') : '';
  const lines = current ? current.split(/\r?\n/) : [];
  let replaced = false;

  const nextLines = lines
    .filter((line, index, arr) => !(index === arr.length - 1 && line === ''))
    .map((line) => {
      if (line.startsWith(`${envName}=`)) {
        replaced = true;
        return nextLine;
      }
      return line;
    });

  if (!replaced) nextLines.push(nextLine);
  writeFileSync(globalEnvPath, `${nextLines.join('\n')}\n`, 'utf8');
  console.log(`saved env: ${globalEnvPath} (${envName})`);
}

function detectProviderFromEnvironment() {
  const matches = Object.values(providerChoices).filter((provider) => {
    if (process.env[provider.envName]) return true;
    if (provider.key === 'gemini' && process.env.GOOGLE_API_KEY) return true;
    return false;
  });

  if (matches.length === 1) {
    return matches[0].key;
  }

  return '';
}

async function chooseProviderInteractively() {
  console.log('\n这是第一次安装 OpenClaw Content OS Starter。');
  console.log('你只需要先准备 1 个 API key。5 个 agent 默认会先共用同一个模型。\n');
  console.log('请选择你现在最想用的模型提供商：');
  console.log('1. OpenAI');
  console.log('2. Anthropic');
  console.log('3. Google Gemini');
  console.log('4. OpenRouter');

  while (true) {
    const answer = await promptText('输入 1 / 2 / 3 / 4: ');
    if (answer === '1') return 'openai';
    if (answer === '2') return 'anthropic';
    if (answer === '3') return 'gemini';
    if (answer === '4') return 'openrouter';
    console.log('输入无效，请重新输入。');
  }
}

function printFreshInstallHelp() {
  console.error('Fresh-machine setup needs one provider and one API key.');
  console.error('For beginners, just rerun this installer in a normal terminal and follow the prompts.');
  console.error('For unattended install, use one of these examples:');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=openai OPENAI_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=anthropic ANTHROPIC_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=gemini GEMINI_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=openrouter OPENROUTER_API_KEY=your_key bash scripts/install.sh');
}

async function ensureFreshMachineOnboard() {
  if (existsSync(configPath)) {
    return { bootstrapped: false, provider: null };
  }

  let providerKey = requestedProvider || detectProviderFromEnvironment();
  if (!providerKey) {
    if (!interactive) {
      printFreshInstallHelp();
      process.exit(1);
    }
    providerKey = await chooseProviderInteractively();
  }

  const provider = providerChoices[providerKey];
  if (!provider) {
    console.error(`Unsupported provider: ${providerKey}`);
    printFreshInstallHelp();
    process.exit(1);
  }

  let apiKey = requestedApiKey || process.env[provider.envName] || '';
  if (!apiKey && provider.key === 'gemini') {
    apiKey = process.env.GOOGLE_API_KEY || '';
  }

  if (!apiKey) {
    if (!interactive) {
      printFreshInstallHelp();
      process.exit(1);
    }
    apiKey = await promptSecret(`请输入 ${provider.label} 的 API key: `);
  }

  if (!apiKey) {
    console.error('API key 不能为空。');
    process.exit(1);
  }

  process.env[provider.envName] = apiKey;
  upsertEnvValue(provider.envName, apiKey);

  console.log('\nNo existing OpenClaw config found. Running first-time onboarding automatically...');
  runOpenClaw([
    'onboard',
    '--non-interactive',
    '--accept-risk',
    '--flow',
    'quickstart',
    '--mode',
    'local',
    '--auth-choice',
    provider.authChoice,
    '--secret-input-mode',
    'ref',
    '--gateway-bind',
    'loopback',
    '--install-daemon',
    '--daemon-runtime',
    'node',
    '--skip-channels',
    '--skip-skills',
    '--skip-ui',
  ]);

  if (requestedModel) {
    runOpenClaw(['models', 'set', requestedModel]);
  }

  return { bootstrapped: true, provider };
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

function installLocalHelperScripts() {
  copyDirContents(join(repoRoot, 'scripts'), join(localStarterRoot, 'scripts'));
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

function readResolvedModel() {
  return tryOpenClaw(['models', 'status', '--plain']) || '';
}

function printSummary(setDefault, freshInstall, provider) {
  const resolvedModel = readResolvedModel();

  console.log('\nDone.');
  console.log('\nInstalled:');
  console.log('- 5 starter agents');
  console.log('- shared starter skills in ~/.openclaw/skills');
  console.log(`- local content data in ${contentHome}`);
  console.log(`- config template in ${templateConfigPath}`);
  console.log(`- local helper scripts in ${join(localStarterRoot, 'scripts')}`);

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

  if (freshInstall && provider) {
    console.log(`- saved your ${provider.label} API key reference in ~/.openclaw/.env`);
  }

  console.log(`- all 5 starter agents currently share one default model${resolvedModel ? `: ${resolvedModel}` : ''}`);
  console.log('- advanced users can later override models per agent in openclaw.json');

  console.log('\nNext step:');
  console.log(`- Verify install: bash ${join(localStarterRoot, 'scripts', 'check.sh')}`);
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

const hadConfigBeforeInstall = existsSync(configPath);
const freshInstall = await ensureFreshMachineOnboard();

if (hadConfigBeforeInstall) {
  backupConfigIfNeeded();
}
installWorkspaceTemplates();
installContentTemplates();
installSkills();
installLocalHelperScripts();
copyIfNeeded(join(repoRoot, 'templates', 'openclaw.json5.template'), templateConfigPath);

const previousAgents = installAgents();
updateAgentToAgentAccess();
const setDefault = maybeSetDefaultBoss(previousAgents);
if (requestedModel) {
  runOpenClaw(['models', 'set', requestedModel]);
}
validateConfig();
printSummary(setDefault, freshInstall.bootstrapped, freshInstall.provider);
