#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { spawnSync } from 'node:child_process';
import { analyzeExistingOpenClawState, shouldProbeExistingSetup } from './existing-openclaw.mjs';
import { buildTemplateConfig, expandHomePath, readStarterManifest, resolveStarterManifest } from './starter-manifest.mjs';
import { getPresetCatalogSkills, loadSkillCatalog, validatePresetSkillsAgainstCatalog } from './skill-catalog.mjs';
import { resolveStarterIdentity } from './starter-identity.mjs';
import {
  buildTelegramAccountId,
  buildTelegramEnvName,
  mergeTelegramAccounts,
  mergeTelegramBindings,
} from './telegram-channel.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '../..');

const force = process.argv.includes('--force') || process.env.FORCE === '1';
const openclawHome = process.env.OPENCLAW_HOME || join(homedir(), '.openclaw');
const contentHome = process.env.CONTENT_OS_HOME || join(homedir(), 'Documents', 'openclaw-content-os-data');
const sharedSkillsDir = join(openclawHome, 'skills');
const directConfigPath = join(openclawHome, 'openclaw.json');
const sandboxConfigPath = join(openclawHome, '.openclaw', 'openclaw.json');
const globalEnvPath = join(openclawHome, '.env');
const templateConfigPath = join(openclawHome, 'openclaw.content-os.template.json5');
const localStarterRoot = join(openclawHome, 'content-os-starter');
const starterManifestPath = join(localStarterRoot, 'starter-manifest.json');
const sandboxMode = process.argv.includes('--sandbox') || process.env.OPENCLAW_CONTENT_OS_SANDBOX === '1';
const requestedGatewayPort = getArgValue('--gateway-port') || process.env.OPENCLAW_CONTENT_OS_GATEWAY_PORT || '';
const requestedModel = getArgValue('--model') || process.env.OPENCLAW_CONTENT_OS_MODEL || '';
const requestedApiKey = getArgValue('--api-key') || '';
const requestedSkipOnboard = process.argv.includes('--skip-onboard') || process.env.OPENCLAW_CONTENT_OS_SKIP_ONBOARD === '1';
const requestedPresetKey = getArgValue('--preset') || process.env.OPENCLAW_CONTENT_OS_PRESET || '';
const requestedAgentPrefix = getArgValue('--agent-prefix') || process.env.OPENCLAW_CONTENT_OS_AGENT_PREFIX || '';
const requestedWorkspacePrefix = getArgValue('--workspace-prefix') || process.env.OPENCLAW_CONTENT_OS_WORKSPACE_PREFIX || '';
const requestedCustomBaseUrl = getArgValue('--custom-base-url') || process.env.OPENCLAW_CONTENT_OS_CUSTOM_BASE_URL || '';
const requestedCustomModelId = getArgValue('--custom-model-id') || process.env.OPENCLAW_CONTENT_OS_CUSTOM_MODEL_ID || '';
const requestedCustomCompatibility = normalizeCustomCompatibility(getArgValue('--custom-compatibility') || process.env.OPENCLAW_CONTENT_OS_CUSTOM_COMPATIBILITY || '');
const requestedTelegramAccountId = getArgValue('--telegram-account-id') || process.env.OPENCLAW_CONTENT_OS_TELEGRAM_ACCOUNT_ID || '';
const requestedSkipTelegram = process.argv.includes('--skip-telegram') || process.env.OPENCLAW_CONTENT_OS_SKIP_TELEGRAM === '1';
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

const providerChoices = {
  minimax: {
    key: 'minimax',
    label: 'MiniMax',
    authChoice: 'minimax-api-key',
    envName: 'MINIMAX_API_KEY',
    exampleModel: 'minimax/MiniMax-M2.5',
    group: 'recommended',
    summary: '国内用户常用，官方支持 API key 与 Portal 两种路径',
  },
  moonshot: {
    key: 'moonshot',
    label: 'Moonshot / Kimi',
    authChoice: 'moonshot-api-key',
    envName: 'MOONSHOT_API_KEY',
    exampleModel: 'moonshot/kimi-k2.5',
    group: 'recommended',
    summary: 'Kimi API 路线，适合直接输 key',
  },
  zai: {
    key: 'zai',
    label: 'Z.AI / GLM',
    authChoice: 'zai-api-key',
    envName: 'ZAI_API_KEY',
    exampleModel: 'zai/glm-5',
    group: 'recommended',
    summary: 'GLM 路线，官方直接支持 zai-api-key',
  },
  openrouter: {
    key: 'openrouter',
    label: 'OpenRouter',
    authChoice: 'openrouter-api-key',
    envName: 'OPENROUTER_API_KEY',
    exampleModel: 'openrouter/openai/gpt-4.1-mini',
    group: 'recommended',
    summary: '一个 key 聚合多个模型，适合想先跑通的人',
  },
  openai: {
    key: 'openai',
    label: 'OpenAI',
    authChoice: 'openai-api-key',
    envName: 'OPENAI_API_KEY',
    exampleModel: 'openai/gpt-5.2',
    group: 'more',
    summary: '国际常用模型提供商',
  },
  gemini: {
    key: 'gemini',
    label: 'Google Gemini',
    authChoice: 'gemini-api-key',
    envName: 'GEMINI_API_KEY',
    exampleModel: 'google/gemini-3-pro-preview',
    aliases: ['google'],
    group: 'more',
    summary: '国际常用，适合 Google 生态用户',
  },
  anthropic: {
    key: 'anthropic',
    label: 'Anthropic',
    authChoice: 'anthropic-api-key',
    envName: 'ANTHROPIC_API_KEY',
    exampleModel: 'anthropic/claude-sonnet-4-5',
    group: 'more',
    summary: '国际常用，强推理与长上下文',
  },
  custom: {
    key: 'custom',
    label: 'Custom API',
    authChoice: 'custom-api-key',
    envName: 'CUSTOM_API_KEY',
    exampleModel: 'starter-custom/your-model',
    group: 'custom',
    summary: '自定义 OpenAI / Anthropic 兼容接口',
  },
};

const requestedProvider = normalizeProviderChoice(getArgValue('--provider') || process.env.OPENCLAW_CONTENT_OS_PROVIDER || '');

const storedStarterManifest = readStarterManifest(starterManifestPath);
const requestedStarterManifest = resolveStarterManifest({
  openclawHome,
  presetKey: requestedPresetKey,
  agentPrefix: requestedAgentPrefix,
  workspacePrefix: requestedWorkspacePrefix,
  storedManifest: storedStarterManifest,
});
const currentConfiguredAgents = configGet('agents.list', []);
const starterIdentity = resolveStarterIdentity({
  requestedAgentPrefix,
  requestedWorkspacePrefix,
  storedManifest: storedStarterManifest,
  currentAgents: currentConfiguredAgents,
  openclawHome,
  roleKeys: requestedStarterManifest.agents.map((agent) => agent.role),
  presetDefaultAgentPrefix: requestedStarterManifest.agentPrefix,
  presetDefaultWorkspacePrefix: requestedStarterManifest.workspacePrefix,
});
const starterManifest = resolveStarterManifest({
  openclawHome,
  presetKey: requestedPresetKey,
  agentPrefix: starterIdentity.agentPrefix,
  workspacePrefix: starterIdentity.workspacePrefix,
  storedManifest: storedStarterManifest,
});
const starterAgents = starterManifest.agents;
const bossAgentId = starterManifest.bossId;
const starterSkills = starterManifest.sharedSkills;
const skillCatalog = loadSkillCatalog();
const presetCatalogSkills = getPresetCatalogSkills(starterManifest, skillCatalog);
const telegramAccountId = buildTelegramAccountId(starterManifest.agentPrefix, requestedTelegramAccountId);
const telegramEnvName = buildTelegramEnvName(starterManifest.agentPrefix);
const requestedTelegramBotToken = getArgValue('--telegram-bot-token')
  || process.env.OPENCLAW_CONTENT_OS_TELEGRAM_BOT_TOKEN
  || process.env[telegramEnvName]
  || process.env.TELEGRAM_BOT_TOKEN
  || '';

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

function runOpenClawStatus(args) {
  const result = spawnSync('openclaw', args, { encoding: 'utf8' });
  return {
    status: result.status ?? 1,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim(),
  };
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

function normalizeCustomCompatibility(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'anthropic') return 'anthropic';
  return 'openai';
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

function configUnset(path) {
  runOpenClaw(['config', 'unset', path]);
}

function getConfigPath() {
  if (existsSync(directConfigPath)) return directConfigPath;
  return sandboxConfigPath;
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
  console.log('推荐提供商（中国用户优先，先跑通最重要）：');
  console.log('1. MiniMax');
  console.log('2. Moonshot / Kimi API');
  console.log('3. Z.AI / GLM');
  console.log('4. OpenRouter');
  console.log('\n更多提供商（国际常用）：');
  console.log('5. OpenAI');
  console.log('6. Google Gemini');
  console.log('7. Anthropic');
  console.log('\n自定义接入：');
  console.log('8. Custom API（OpenAI / Anthropic 兼容接口）');
  console.log('\n说明：Qwen Portal、MiniMax Portal 这类官方 OAuth 登录流，先装完 starter 后再按官方文档补登录，会更稳。');

  while (true) {
    const answer = await promptText('输入 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8: ');
    if (answer === '1') return 'minimax';
    if (answer === '2') return 'moonshot';
    if (answer === '3') return 'zai';
    if (answer === '4') return 'openrouter';
    if (answer === '5') return 'openai';
    if (answer === '6') return 'gemini';
    if (answer === '7') return 'anthropic';
    if (answer === '8') return 'custom';
    console.log('输入无效，请重新输入。');
  }
}

async function chooseFreshInstallMode() {
  console.log('\n当前没有检测到可复用的 OpenClaw 配置。');
  console.log('这个 starter 默认更适合已经装好 OpenClaw 的用户。');
  console.log('你可以：');
  console.log('1. 现在继续做首次初始化（需要 provider + API key）');
  console.log('2. 先跳过，等你按官方流程配好 OpenClaw 后再回来');

  while (true) {
    const answer = await promptText('输入 1 或 2: ');
    if (answer === '1') return 'bootstrap';
    if (answer === '2') return 'skip';
    console.log('输入无效，请重新输入。');
  }
}

async function chooseTelegramInstallMode() {
  console.log('\n可选：现在把 Telegram 私聊入口接到当前 boss。');
  console.log(`默认会把 Telegram 绑定到 ${bossAgentId}，其他 agent 仍然走内部协作。`);
  console.log('1. 现在接入 Telegram（需要 bot token）');
  console.log('2. 先跳过，后面再配');

  while (true) {
    const answer = await promptText('输入 1 或 2: ');
    if (answer === '1') return 'configure';
    if (answer === '2') return 'skip';
    console.log('输入无效，请重新输入。');
  }
}

function printFreshInstallHelp() {
  console.error('No reusable OpenClaw setup detected.');
  console.error('This starter now defaults to reusing an existing OpenClaw config and model when available.');
  console.error('For beginners, just rerun this installer in a normal terminal and follow the prompts.');
  console.error('If you want to stop before onboarding, use:');
  console.error('  bash scripts/install.sh --skip-onboard');
  console.error('For unattended install, use one of these examples:');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=minimax MINIMAX_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=moonshot MOONSHOT_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=zai ZAI_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=openrouter OPENROUTER_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=openai OPENAI_API_KEY=your_key bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PROVIDER=custom CUSTOM_API_KEY=your_key OPENCLAW_CONTENT_OS_CUSTOM_BASE_URL=https://llm.example.com/v1 OPENCLAW_CONTENT_OS_CUSTOM_MODEL_ID=foo-large bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_PRESET=content-basic bash scripts/install.sh');
  console.error('  OPENCLAW_CONTENT_OS_AGENT_PREFIX=acme OPENCLAW_CONTENT_OS_WORKSPACE_PREFIX=workspace-acme-content bash scripts/install.sh');
  console.error('Official OAuth login flows such as qwen-portal or minimax-portal are documented by OpenClaw, but they are not part of this starter\'s one-key path.');
}

async function collectProviderSettings(provider) {
  let apiKey = requestedApiKey || process.env[provider.envName] || '';
  if (!apiKey && provider.key === 'gemini') {
    apiKey = process.env.GOOGLE_API_KEY || '';
  }

  let customBaseUrl = requestedCustomBaseUrl;
  let customModelId = requestedCustomModelId;
  let customCompatibility = requestedCustomCompatibility;

  if (provider.key === 'custom') {
    if (!customBaseUrl && interactive) {
      customBaseUrl = await promptText('请输入自定义接口 Base URL，例如 https://llm.example.com/v1: ');
    }
    if (!customModelId && interactive) {
      customModelId = await promptText('请输入默认模型 ID，例如 foo-large: ');
    }
    if (!requestedCustomCompatibility && interactive) {
      const answer = await promptText('接口兼容类型是 openai 还是 anthropic？默认 openai，直接回车即可: ');
      customCompatibility = normalizeCustomCompatibility(answer);
    }
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

  if (provider.key === 'custom') {
    if (!customBaseUrl || !customModelId) {
      console.error('Custom API 需要 Base URL 和模型 ID。');
      process.exit(1);
    }
  }

  return {
    apiKey,
    customBaseUrl,
    customModelId,
    customCompatibility,
  };
}

function buildOnboardArgs(provider, settings) {
  const args = [
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
    '--workspace',
    join(openclawHome, 'workspace'),
    '--skip-channels',
    '--skip-skills',
    '--skip-ui',
  ];

  if (sandboxMode) {
    args.push('--no-install-daemon');
    args.push('--skip-health');
    args.push('--gateway-port', requestedGatewayPort || '18891');
  } else {
    args.push('--install-daemon');
    args.push('--daemon-runtime', 'node');
  }

  if (provider.key === 'custom') {
    args.push('--custom-base-url', settings.customBaseUrl);
    args.push('--custom-model-id', settings.customModelId);
    args.push('--custom-compatibility', settings.customCompatibility);
    args.push('--custom-provider-id', 'starter-custom');
  }

  return args;
}

async function ensureFreshMachineOnboard() {
  const hasConfigFile = existsSync(getConfigPath());
  const shouldProbe = shouldProbeExistingSetup({ sandboxMode, hasConfigFile });
  const existingState = analyzeExistingOpenClawState({
    hasConfigFile,
    configValidateStatus: shouldProbe ? runOpenClawStatus(['config', 'validate']).status : 1,
    modelStatusOutput: shouldProbe ? (tryOpenClaw(['models', 'status', '--plain']) || '') : '',
  });

  if (existingState.canReuseExistingSetup) {
    if (existingState.reason === 'config-validate' || existingState.reason === 'model-status') {
      console.log(`Detected existing OpenClaw setup${existingState.detectedModel ? ` (${existingState.detectedModel})` : ''}. Reusing it without asking for a new API key.`);
    }
    return { bootstrapped: false, provider: null, reusedExistingSetup: true };
  }

  if (requestedSkipOnboard) {
    console.log('No reusable OpenClaw setup found. Stopping before onboarding because --skip-onboard was requested.');
    console.log('Next step: finish official OpenClaw setup first, then rerun this installer.');
    process.exit(0);
  }

  let providerKey = requestedProvider || detectProviderFromEnvironment();
  if (!providerKey) {
    if (!interactive) {
      printFreshInstallHelp();
      process.exit(1);
    }
    const mode = await chooseFreshInstallMode();
    if (mode === 'skip') {
      console.log('Starter install stopped before onboarding.');
      console.log('Next step: finish official OpenClaw setup first, then rerun this installer.');
      process.exit(0);
    }
    providerKey = await chooseProviderInteractively();
  }

  const provider = providerChoices[providerKey];
  if (!provider) {
    console.error(`Unsupported provider: ${providerKey}`);
    printFreshInstallHelp();
    process.exit(1);
  }

  const settings = await collectProviderSettings(provider);

  process.env[provider.envName] = settings.apiKey;
  upsertEnvValue(provider.envName, settings.apiKey);

  console.log('\nNo existing OpenClaw config found. Running first-time onboarding automatically...');
  runOpenClaw(buildOnboardArgs(provider, settings));

  const providerDefaultModel = provider.key === 'custom' ? `starter-custom/${settings.customModelId}` : '';
  const preferredModel = requestedModel || providerDefaultModel;
  if (preferredModel) {
    runOpenClaw(['models', 'set', preferredModel]);
  }

  return { bootstrapped: true, provider };
}

async function collectOptionalTelegramSetup() {
  const currentBindings = configGet('bindings', []);
  const currentAccounts = configGet('channels.telegram.accounts', {});
  const bossTelegramBinding = Array.isArray(currentBindings)
    ? currentBindings.find((binding) => binding?.agentId === bossAgentId && binding?.match?.channel === 'telegram')
    : null;

  if (requestedSkipTelegram) {
    return { status: 'skipped', reason: 'requested' };
  }

  if (requestedTelegramBotToken) {
    return {
      status: 'configure',
      accountId: telegramAccountId,
      envName: telegramEnvName,
      botToken: requestedTelegramBotToken,
      source: 'provided',
    };
  }

  if (bossTelegramBinding || currentAccounts?.[telegramAccountId]) {
    return {
      status: 'existing',
      accountId: bossTelegramBinding?.match?.accountId || telegramAccountId,
      reason: 'already-configured',
    };
  }

  if (!interactive) {
    return { status: 'skipped', reason: 'non-interactive' };
  }

  const mode = await chooseTelegramInstallMode();
  if (mode === 'skip') {
    return { status: 'skipped', reason: 'interactive-skip' };
  }

  const botToken = await promptSecret('请输入 Telegram bot token: ');
  if (!botToken) {
    console.log('Telegram bot token 为空，已跳过这一步。');
    return { status: 'skipped', reason: 'empty-token' };
  }

  return {
    status: 'configure',
    accountId: telegramAccountId,
    envName: telegramEnvName,
    botToken,
    source: 'prompt',
  };
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

function assertRepoAssetsReady() {
  const missing = [];

  if (!existsSync(join(repoRoot, 'templates', 'content-system'))) {
    missing.push('templates/content-system/');
  }

  if (!existsSync(join(repoRoot, 'skills'))) {
    missing.push('skills/');
  }

  if (!existsSync(join(repoRoot, 'catalog', 'skills.json'))) {
    missing.push('catalog/skills.json');
  }

  const presetPath = join(repoRoot, 'presets', `${starterManifest.presetKey}.json`);
  if (!existsSync(presetPath)) {
    missing.push(`presets/${starterManifest.presetKey}.json`);
  }

  const missingCatalogSkills = validatePresetSkillsAgainstCatalog(starterManifest, skillCatalog);
  for (const skill of missingCatalogSkills) {
    missing.push(`catalog/skills.json missing ${skill}`);
  }

  for (const agent of starterAgents) {
    const workspaceTemplateDir = join(repoRoot, 'templates', 'workspaces', agent.workspaceTemplate);
    for (const fileName of ['AGENTS.md', 'SOUL.md', 'TOOLS.md']) {
      const target = join(workspaceTemplateDir, fileName);
      if (!existsSync(target)) {
        missing.push(`templates/workspaces/${agent.workspaceTemplate}/${fileName}`);
      }
    }
  }

  for (const skill of presetCatalogSkills) {
    if (skill.source.type !== 'built-in') {
      continue;
    }
    const skillFile = join(repoRoot, skill.source.path, 'SKILL.md');
    if (!existsSync(skillFile)) {
      missing.push(`${skill.source.path}/SKILL.md`);
    }
  }

  if (missing.length === 0) return;

  console.error('Starter assets are incomplete. Fix these files first:');
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

function assertNoStarterConflicts() {
  const currentAgents = configGet('agents.list', []);
  const agentsById = new Map((currentAgents || []).map((agent) => [agent.id, agent]));
  const workspaceOwners = new Map();
  const conflicts = [];

  for (const agent of currentAgents || []) {
    const workspace = expandHomePath(agent.workspace || '');
    if (!workspace) continue;
    workspaceOwners.set(workspace, agent.id);
  }

  for (const agent of starterAgents) {
    const existingById = agentsById.get(agent.id);
    if (existingById) {
      const existingWorkspace = expandHomePath(existingById.workspace || '');
      if (!existingWorkspace) {
        conflicts.push(`${agent.id} already exists but has no workspace configured.`);
      } else if (existingWorkspace !== agent.workspace) {
        conflicts.push(`${agent.id} already points to ${existingWorkspace}, expected ${agent.workspace}.`);
      }
    }

    const workspaceOwner = workspaceOwners.get(agent.workspace);
    if (workspaceOwner && workspaceOwner !== agent.id) {
      conflicts.push(`${agent.workspace} is already used by ${workspaceOwner}, expected ${agent.id}.`);
    }
  }

  if (conflicts.length === 0) return;

  console.error('Starter install stopped because existing agent/workspace settings would collide:');
  for (const conflict of conflicts) {
    console.error(`- ${conflict}`);
  }
  console.error('Use a different agent prefix or workspace prefix, for example:');
  console.error('  OPENCLAW_CONTENT_OS_AGENT_PREFIX=acme OPENCLAW_CONTENT_OS_WORKSPACE_PREFIX=workspace-acme-content bash scripts/install.sh');
  process.exit(1);
}

function writeStarterManifest() {
  ensureDir(localStarterRoot);
  writeFileSync(starterManifestPath, `${JSON.stringify(starterManifest, null, 2)}\n`, 'utf8');
  console.log(`saved starter manifest: ${starterManifestPath}`);
}

function writeGeneratedTemplateConfig() {
  const nextContent = buildTemplateConfig(starterManifest);
  ensureDir(dirname(templateConfigPath));

  if (existsSync(templateConfigPath)) {
    const current = readFileSync(templateConfigPath, 'utf8');
    if (current !== nextContent) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${templateConfigPath}.bak.${stamp}`;
      copyFileSync(templateConfigPath, backupPath);
      console.log(`backup: ${backupPath}`);
    }
  }

  writeFileSync(templateConfigPath, nextContent, 'utf8');
  console.log(`write: ${templateConfigPath}`);
}

function backupConfigIfNeeded() {
  const configPath = getConfigPath();
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
    const srcDir = join(repoRoot, 'templates', 'workspaces', agent.workspaceTemplate);
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
  ensureDir(sharedSkillsDir);
  for (const skill of presetCatalogSkills) {
    if (skill.source.type !== 'built-in') {
      console.log(`skip external skill: ${skill.slug}`);
      continue;
    }
    const src = join(repoRoot, skill.source.path);
    if (!statSync(src).isDirectory()) continue;
    const dst = join(sharedSkillsDir, skill.slug);
    copyDirContents(src, dst);
  }
}

function installTelegramChannel(telegramSetup) {
  if (!telegramSetup || telegramSetup.status !== 'configure') return telegramSetup;

  process.env[telegramSetup.envName] = telegramSetup.botToken;
  upsertEnvValue(telegramSetup.envName, telegramSetup.botToken);

  const nextAccounts = mergeTelegramAccounts(
    configGet('channels.telegram.accounts', {}),
    telegramSetup.accountId,
    telegramSetup.envName,
  );
  const nextBindings = mergeTelegramBindings(
    configGet('bindings', []),
    bossAgentId,
    telegramSetup.accountId,
  );

  configSet('channels.telegram.accounts', nextAccounts);
  configSet('bindings', nextBindings);
  console.log(`telegram configured: ${telegramSetup.accountId} -> ${bossAgentId}`);

  return telegramSetup;
}

function installLocalHelperScripts() {
  copyDirContents(join(repoRoot, 'scripts'), join(localStarterRoot, 'scripts'));
}

function installAgents() {
  const existingAgents = configGet('agents.list', []);
  const existingIds = new Set((existingAgents || []).map((item) => item.id));

  for (const agent of starterAgents) {
    if (existingIds.has(agent.id)) {
      console.log(`skip agent: ${agent.id} (${agent.workspace})`);
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

function updateStarterSubagentAllowlist() {
  const currentAgents = configGet('agents.list', []);
  const starterAgentIds = starterAgents.map((agent) => agent.id);
  const starterAgentIdSet = new Set(starterAgentIds);

  for (const [index, agent] of (currentAgents || []).entries()) {
    if (!starterAgentIdSet.has(agent.id)) continue;
    const currentAllow = Array.isArray(agent.subagents?.allowAgents) ? agent.subagents.allowAgents : [];
    const mergedAllow = Array.from(new Set([...(currentAllow || []), ...starterAgentIds]));
    configSet(`agents.list.${index}.subagents.allowAgents`, mergedAllow);
  }
}

function maybeSetDefaultBoss() {
  const currentAgents = configGet('agents.list', []);
  const configuredIds = new Set((currentAgents || []).map((agent) => agent.id));
  const expectedIds = new Set(['main', ...starterAgents.map((agent) => agent.id)]);

  if ((currentAgents || []).length !== expectedIds.size) {
    return false;
  }

  for (const agentId of expectedIds) {
    if (!configuredIds.has(agentId)) {
      return false;
    }
  }

  const bossIndex = (currentAgents || []).findIndex((agent) => agent.id === bossAgentId);
  if (bossIndex === -1) {
    return false;
  }

  for (const [index, agent] of (currentAgents || []).entries()) {
    if (!agent.default) continue;
    if (agent.id === bossAgentId) {
      return false;
    }
    configUnset(`agents.list.${index}.default`);
  }

  configSet(`agents.list.${bossIndex}.default`, true);
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

function printSummary(setDefault, freshInstall, provider, telegramSetup) {
  const resolvedModel = readResolvedModel();
  const starterCount = starterAgents.length;

  console.log('\nDone.');
  console.log('\nInstalled:');
  console.log(`- preset ${starterManifest.presetKey}`);
  console.log(`- ${starterCount} starter agents`);
  console.log(`- ${presetCatalogSkills.length} preset skills in ~/.openclaw/skills`);
  console.log(`- local content data in ${contentHome}`);
  console.log(`- config template in ${templateConfigPath}`);
  console.log(`- local helper scripts in ${join(localStarterRoot, 'scripts')}`);
  console.log(`- starter manifest in ${starterManifestPath}`);

  console.log('\nWhat changed automatically:');
  console.log('- copied workspace templates');
  console.log('- copied preset skills from catalog');
  console.log('- created starter agents if missing');
  console.log('- enabled tools.agentToAgent and merged allow list');
  console.log(`- using preset ${starterManifest.presetKey}`);
  console.log(`- using agent prefix ${starterManifest.agentPrefix} and workspace prefix ${starterManifest.workspacePrefix}`);
  if (starterIdentity.mode === 'automatic') {
    console.log('- auto-generated starter identity because no prefix was provided');
  } else if (starterIdentity.mode === 'detected-existing') {
    console.log('- reused an existing starter identity already present on this machine');
  } else if (starterIdentity.mode === 'stored') {
    console.log('- reused the previously installed starter identity from starter-manifest.json');
  }

  if (setDefault) {
    console.log(`- set ${bossAgentId} as the default agent because this looked like a fresh install`);
  } else {
    console.log('- kept your existing default-agent behavior unchanged');
  }

  if (freshInstall && provider) {
    console.log(`- saved your ${provider.label} API key reference in ${globalEnvPath}`);
  }

  if (telegramSetup?.status === 'configure') {
    console.log(`- saved your Telegram bot token reference in ${globalEnvPath} (${telegramSetup.envName})`);
    console.log(`- routed Telegram account ${telegramSetup.accountId} to ${bossAgentId}`);
  } else if (telegramSetup?.status === 'existing') {
    console.log('- kept your existing Telegram channel config unchanged');
  } else {
    console.log('- left Telegram unconfigured for now');
  }

  if (sandboxMode) {
    console.log(`- sandbox mode enabled (no daemon install, gateway port ${requestedGatewayPort || '18891'})`);
  }

  console.log(`- all ${starterCount} starter agents currently share one default model${resolvedModel ? `: ${resolvedModel}` : ''}`);
  console.log('- advanced users can later override models per agent in openclaw.json');

  console.log('\nNext step:');
  console.log(`- Verify install: bash ${join(localStarterRoot, 'scripts', 'check.sh')}`);
  if (gatewayStatus()) {
    console.log(`- Open a NEW session in Control UI and switch to ${bossAgentId} if needed`);
  } else {
    console.log('- Start or restart the gateway: openclaw gateway restart');
  }
  console.log('- Then send: 请按这个 starter 的默认流程，帮我规划一篇内容，从素材整理开始。');
  if (telegramSetup?.status === 'configure') {
    console.log(`- In Telegram, open your bot and send /start. If pairing asks for approval, confirm it in OpenClaw.`);
  }

  console.log('\nOptional later:');
  if (telegramSetup?.status !== 'configure') {
    console.log('- Add Telegram or other channels after the local workflow works');
  }
  console.log('- Review the public template at ~/.openclaw/openclaw.content-os.template.json5');
}

ensureCommand('openclaw');
ensureCommand('node');
assertRepoAssetsReady();

const hadConfigBeforeInstall = existsSync(getConfigPath());
const freshInstall = await ensureFreshMachineOnboard();
assertNoStarterConflicts();

if (hadConfigBeforeInstall) {
  backupConfigIfNeeded();
}
installWorkspaceTemplates();
installContentTemplates();
installSkills();
installLocalHelperScripts();
writeGeneratedTemplateConfig();
writeStarterManifest();

installAgents();
updateAgentToAgentAccess();
updateStarterSubagentAllowlist();
const setDefault = maybeSetDefaultBoss();
const telegramSetup = installTelegramChannel(await collectOptionalTelegramSetup());
if (requestedModel) {
  runOpenClaw(['models', 'set', requestedModel]);
}
validateConfig();
printSummary(setDefault, freshInstall.bootstrapped, freshInstall.provider, telegramSetup);
