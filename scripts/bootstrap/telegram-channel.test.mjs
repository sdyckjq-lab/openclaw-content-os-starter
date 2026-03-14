import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildTelegramAccountId,
  buildTelegramEnvName,
  mergeTelegramAccounts,
  mergeTelegramBindings,
} from './telegram-channel.mjs';

test('builds a starter-specific telegram account id', () => {
  assert.equal(buildTelegramAccountId('starter'), 'starter-telegram');
  assert.equal(buildTelegramAccountId('Client Team'), 'client-team-telegram');
  assert.equal(buildTelegramAccountId('starter', 'Boss Inbox'), 'boss-inbox');
});

test('builds a starter-specific telegram env name', () => {
  assert.equal(buildTelegramEnvName('starter'), 'OPENCLAW_CONTENT_OS_STARTER_TELEGRAM_BOT_TOKEN');
  assert.equal(buildTelegramEnvName('starter-2'), 'OPENCLAW_CONTENT_OS_STARTER_2_TELEGRAM_BOT_TOKEN');
});

test('merges telegram accounts without removing existing accounts', () => {
  const accounts = mergeTelegramAccounts(
    {
      existing: {
        botToken: '${EXISTING_TELEGRAM_BOT_TOKEN}',
        dmPolicy: 'pairing',
      },
    },
    'starter-telegram',
    'OPENCLAW_CONTENT_OS_STARTER_TELEGRAM_BOT_TOKEN',
  );

  assert.deepEqual(accounts, {
    existing: {
      botToken: '${EXISTING_TELEGRAM_BOT_TOKEN}',
      dmPolicy: 'pairing',
    },
    'starter-telegram': {
      botToken: '${OPENCLAW_CONTENT_OS_STARTER_TELEGRAM_BOT_TOKEN}',
      dmPolicy: 'pairing',
    },
  });
});

test('merges telegram bindings without duplicating the boss route', () => {
  const once = mergeTelegramBindings([], 'starter-boss', 'starter-telegram');
  const twice = mergeTelegramBindings(once, 'starter-boss', 'starter-telegram');

  assert.deepEqual(once, [
    {
      agentId: 'starter-boss',
      match: {
        channel: 'telegram',
        accountId: 'starter-telegram',
      },
    },
  ]);
  assert.deepEqual(twice, once);
});
