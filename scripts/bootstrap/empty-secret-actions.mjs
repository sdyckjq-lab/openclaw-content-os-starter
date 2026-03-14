function buildEmptySecretActions({ label, canSkip }) {
  const normalizedLabel = String(label || '密钥').trim();

  if (canSkip) {
    return [
      {
        label: '重新输入',
        description: '刚才可能只是按空了回车',
        value: 'retry',
      },
      {
        label: '先跳过',
        description: `后面再配 ${normalizedLabel}`,
        value: 'skip',
      },
    ];
  }

  return [
    {
      label: '重新输入',
      description: `${normalizedLabel} 不能为空，返回继续输入`,
      value: 'retry',
    },
  ];
}

export { buildEmptySecretActions };
