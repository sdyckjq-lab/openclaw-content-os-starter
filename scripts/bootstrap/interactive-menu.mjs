function moveSelection(currentIndex, direction, optionCount) {
  if (optionCount <= 0) return 0;
  if (direction === 'up') {
    return currentIndex <= 0 ? optionCount - 1 : currentIndex - 1;
  }
  if (direction === 'down') {
    return currentIndex >= optionCount - 1 ? 0 : currentIndex + 1;
  }
  return currentIndex;
}

function resolveNumericSelection(value, optionCount) {
  const normalized = String(value || '').trim();
  if (!/^\d+$/.test(normalized)) return null;

  const numericValue = Number(normalized);
  if (numericValue < 1 || numericValue > optionCount) return null;
  return numericValue - 1;
}

function formatMenu({ title, hint = '', options, selectedIndex = 0 }) {
  const lines = [];

  if (title) lines.push(title);
  if (hint) lines.push(hint);
  if (title || hint) lines.push('');

  for (const [index, option] of options.entries()) {
    const marker = index === selectedIndex ? '>' : ' ';
    const number = `${index + 1}.`;
    const description = option.description ? ` - ${option.description}` : '';
    lines.push(`${marker} ${number} ${option.label}${description}`);
  }

  return `${lines.join('\n')}\n`;
}

async function selectOptionInteractively({ title, hint = '', options, initialIndex = 0, input, output }) {
  if (!input || !output || !input.isTTY || !output.isTTY) {
    throw new Error('Interactive menu requires TTY input/output.');
  }

  let selectedIndex = Math.max(0, Math.min(initialIndex, options.length - 1));
  let numericBuffer = '';

  function render() {
    output.write('\x1b[2J\x1b[H');
    output.write(formatMenu({ title, hint, options, selectedIndex }));
    if (numericBuffer) {
      output.write(`\n已输入编号: ${numericBuffer}\n`);
    }
  }

  render();
  input.resume();
  input.setEncoding('utf8');
  input.setRawMode(true);

  return await new Promise((resolve, reject) => {
    function cleanup() {
      input.removeListener('data', onData);
      input.setRawMode(false);
      input.pause();
      output.write('\n');
    }

    function onData(chunk) {
      const value = String(chunk);

      if (value === '\u0003') {
        cleanup();
        reject(new Error('Installation cancelled by user.'));
        return;
      }

      if (value === '\r' || value === '\n') {
        const numericSelection = resolveNumericSelection(numericBuffer, options.length);
        if (numericSelection !== null) {
          selectedIndex = numericSelection;
        }
        const selectedOption = options[selectedIndex];
        cleanup();
        resolve(selectedOption);
        return;
      }

      if (value === '\u001b[A') {
        numericBuffer = '';
        selectedIndex = moveSelection(selectedIndex, 'up', options.length);
        render();
        return;
      }

      if (value === '\u001b[B') {
        numericBuffer = '';
        selectedIndex = moveSelection(selectedIndex, 'down', options.length);
        render();
        return;
      }

      if (value === '\u007f') {
        if (!numericBuffer) return;
        numericBuffer = numericBuffer.slice(0, -1);
        render();
        return;
      }

      if (/^\d$/.test(value)) {
        numericBuffer += value;
        const numericSelection = resolveNumericSelection(numericBuffer, options.length);
        if (numericSelection !== null) {
          selectedIndex = numericSelection;
        }
        render();
      }
    }

    input.on('data', onData);
  });
}

export { formatMenu, moveSelection, resolveNumericSelection, selectOptionInteractively };
