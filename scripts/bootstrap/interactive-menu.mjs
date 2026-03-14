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

function formatMenu({ title, hint = '', options, selectedIndex = 0 }) {
  const lines = [];

  if (title) lines.push(title);
  if (hint) lines.push(hint);
  if (title || hint) lines.push('');

  for (const [index, option] of options.entries()) {
    const marker = index === selectedIndex ? '>' : ' ';
    const description = option.description ? ` - ${option.description}` : '';
    lines.push(`${marker} ${option.label}${description}`);
  }

  return `${lines.join('\n')}\n`;
}

async function selectOptionInteractively({ title, hint = '', options, initialIndex = 0, input, output }) {
  if (!input || !output || !input.isTTY || !output.isTTY) {
    throw new Error('Interactive menu requires TTY input/output.');
  }

  let selectedIndex = Math.max(0, Math.min(initialIndex, options.length - 1));

  function render() {
    output.write('\x1b[2J\x1b[H');
    output.write(formatMenu({ title, hint, options, selectedIndex }));
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
        const selectedOption = options[selectedIndex];
        cleanup();
        resolve(selectedOption);
        return;
      }

      if (value === '\u001b[A') {
        selectedIndex = moveSelection(selectedIndex, 'up', options.length);
        render();
        return;
      }

      if (value === '\u001b[B') {
        selectedIndex = moveSelection(selectedIndex, 'down', options.length);
        render();
      }
    }

    input.on('data', onData);
  });
}

export { formatMenu, moveSelection, selectOptionInteractively };
