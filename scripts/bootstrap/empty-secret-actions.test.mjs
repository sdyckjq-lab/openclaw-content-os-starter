import test from 'node:test';
import assert from 'node:assert/strict';

import { buildEmptySecretActions } from './empty-secret-actions.mjs';

test('builds retry-and-skip actions for optional secrets', () => {
  assert.deepEqual(
    buildEmptySecretActions({
      label: 'Telegram',
      canSkip: true,
    }),
    [
      { label: '重新输入', description: '刚才可能只是按空了回车', value: 'retry' },
      { label: '先跳过', description: '后面再配 Telegram', value: 'skip' },
    ],
  );
});

test('builds retry-only actions for required secrets', () => {
  assert.deepEqual(
    buildEmptySecretActions({
      label: 'API key',
      canSkip: false,
    }),
    [
      { label: '重新输入', description: 'API key 不能为空，返回继续输入', value: 'retry' },
    ],
  );
});
