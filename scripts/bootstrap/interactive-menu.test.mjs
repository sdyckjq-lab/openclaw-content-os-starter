import test from 'node:test';
import assert from 'node:assert/strict';

import { formatMenu, moveSelection } from './interactive-menu.mjs';

test('moves selection down and wraps at the end', () => {
  assert.equal(moveSelection(0, 'down', 3), 1);
  assert.equal(moveSelection(2, 'down', 3), 0);
});

test('moves selection up and wraps at the start', () => {
  assert.equal(moveSelection(1, 'up', 3), 0);
  assert.equal(moveSelection(0, 'up', 3), 2);
});

test('formats menu with a selected option marker and hint', () => {
  const output = formatMenu({
    title: '请选择 provider',
    hint: '用上下方向键选择，回车确认。',
    options: [
      { label: 'MiniMax', description: '国内用户常用' },
      { label: 'Moonshot', description: '适合直接输 key' },
    ],
    selectedIndex: 1,
  });

  assert.match(output, /请选择 provider/);
  assert.match(output, /用上下方向键选择，回车确认。/);
  assert.match(output, /  MiniMax - 国内用户常用/);
  assert.match(output, /> Moonshot - 适合直接输 key/);
});
