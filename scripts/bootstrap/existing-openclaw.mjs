function normalizeModelStatusOutput(output) {
  return String(output || '').trim();
}

function shouldProbeExistingSetup({ sandboxMode, hasConfigFile }) {
  if (hasConfigFile) return true;
  return !sandboxMode;
}

function analyzeExistingOpenClawState({ hasConfigFile, configValidateStatus, modelStatusOutput }) {
  const detectedModel = normalizeModelStatusOutput(modelStatusOutput);

  if (hasConfigFile) {
    return {
      canReuseExistingSetup: true,
      reason: 'config-file',
      detectedModel,
    };
  }

  if (configValidateStatus === 0) {
    return {
      canReuseExistingSetup: true,
      reason: 'config-validate',
      detectedModel,
    };
  }

  if (detectedModel) {
    return {
      canReuseExistingSetup: true,
      reason: 'model-status',
      detectedModel,
    };
  }

  return {
    canReuseExistingSetup: false,
    reason: 'missing-setup',
    detectedModel: '',
  };
}

export { analyzeExistingOpenClawState, normalizeModelStatusOutput, shouldProbeExistingSetup };
