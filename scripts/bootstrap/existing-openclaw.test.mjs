import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeExistingOpenClawState, shouldProbeExistingSetup } from './existing-openclaw.mjs';

test('reuses existing setup when config file exists', () => {
  const state = analyzeExistingOpenClawState({
    hasConfigFile: true,
    configValidateStatus: 1,
    modelStatusOutput: '',
  });

  assert.equal(state.canReuseExistingSetup, true);
  assert.equal(state.reason, 'config-file');
});

test('reuses existing setup when config validates without local file detection', () => {
  const state = analyzeExistingOpenClawState({
    hasConfigFile: false,
    configValidateStatus: 0,
    modelStatusOutput: 'xairouter/glm-5',
  });

  assert.equal(state.canReuseExistingSetup, true);
  assert.equal(state.reason, 'config-validate');
  assert.equal(state.detectedModel, 'xairouter/glm-5');
});

test('reuses existing setup when model status is already available', () => {
  const state = analyzeExistingOpenClawState({
    hasConfigFile: false,
    configValidateStatus: 1,
    modelStatusOutput: 'openrouter/openai/gpt-4.1-mini',
  });

  assert.equal(state.canReuseExistingSetup, true);
  assert.equal(state.reason, 'model-status');
});

test('requires onboarding when no config and no model exist', () => {
  const state = analyzeExistingOpenClawState({
    hasConfigFile: false,
    configValidateStatus: 1,
    modelStatusOutput: '',
  });

  assert.equal(state.canReuseExistingSetup, false);
  assert.equal(state.reason, 'missing-setup');
});

test('does not probe real setup from an empty sandbox', () => {
  assert.equal(shouldProbeExistingSetup({ sandboxMode: true, hasConfigFile: false }), false);
  assert.equal(shouldProbeExistingSetup({ sandboxMode: false, hasConfigFile: false }), true);
});
