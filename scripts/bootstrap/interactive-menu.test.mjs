import test from 'node:test';
import assert from 'node:assert/strict';

import { formatMenu, moveSelection, resolveNumericSelection } from './interactive-menu.mjs';

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
    hint: '用上下方向键选择，也可以输入数字，按回车确认。',
    options: [
      { label: 'MiniMax', description: '国内用户常用' },
      { label: 'Moonshot', description: '适合直接输 key' },
    ],
    selectedIndex: 1,
  });

  assert.match(output, /请选择 provider/);
  assert.match(output, /用上下方向键选择，也可以输入数字，按回车确认。/);
  assert.match(output, /  1\. MiniMax - 国内用户常用/);
  assert.match(output, /> 2\. Moonshot - 适合直接输 key/);
});

test('resolves numeric selection to zero-based index', () => {
  assert.equal(resolveNumericSelection('1', 4), 0);
  assert.equal(resolveNumericSelection('4', 4), 3);
  assert.equal(resolveNumericSelection('0', 4), null);
  assert.equal(resolveNumericSelection('5', 4), null);
  assert.equal(resolveNumericSelection('abc', 4), null);
});
