function normalizeSlug(value, fallback = '') {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;

  const normalized = raw
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || fallback;
}

function normalizeEnvPart(value, fallback = 'STARTER') {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return normalized || fallback;
}

function buildTelegramAccountId(agentPrefix, requestedAccountId = '') {
  const preferredAccountId = normalizeSlug(requestedAccountId, '');
  if (preferredAccountId) return preferredAccountId;

  const normalizedPrefix = normalizeSlug(agentPrefix, 'starter');
  return `${normalizedPrefix}-telegram`;
}

function buildTelegramEnvName(agentPrefix) {
  const envPart = normalizeEnvPart(agentPrefix, 'STARTER');
  return `OPENCLAW_CONTENT_OS_${envPart}_TELEGRAM_BOT_TOKEN`;
}

function mergeTelegramAccounts(currentAccounts, accountId, envName) {
  const nextAccounts = {
    ...(currentAccounts || {}),
  };

  nextAccounts[accountId] = {
    ...(nextAccounts[accountId] || {}),
    botToken: `\${${envName}}`,
    dmPolicy: 'pairing',
  };

  return nextAccounts;
}

function mergeTelegramBindings(currentBindings, bossAgentId, accountId) {
  const bindings = Array.isArray(currentBindings) ? [...currentBindings] : [];
  const hasBinding = bindings.some((binding) => (
    binding?.agentId === bossAgentId
    && binding?.match?.channel === 'telegram'
    && binding?.match?.accountId === accountId
  ));

  if (hasBinding) return bindings;

  bindings.push({
    agentId: bossAgentId,
    match: {
      channel: 'telegram',
      accountId,
    },
  });

  return bindings;
}

export {
  buildTelegramAccountId,
  buildTelegramEnvName,
  mergeTelegramAccounts,
  mergeTelegramBindings,
};
