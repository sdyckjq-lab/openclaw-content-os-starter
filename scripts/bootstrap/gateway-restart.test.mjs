import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeGatewayRestart } from './gateway-restart.mjs';

test('summarizes sandbox installs without automatic restart', () => {
  assert.deepEqual(
    summarizeGatewayRestart({
      sandboxMode: true,
      restartAttempted: false,
      restartSucceeded: false,
      gatewayRunning: false,
    }),
    {
      status: 'sandbox',
      userMessage: 'sandbox mode skips automatic gateway restart',
    },
  );
});

test('summarizes successful automatic restart', () => {
  assert.deepEqual(
    summarizeGatewayRestart({
      sandboxMode: false,
      restartAttempted: true,
      restartSucceeded: true,
      gatewayRunning: true,
    }),
    {
      status: 'restarted',
      userMessage: 'gateway restarted automatically',
    },
  );
});

test('summarizes manual restart fallback when restart did not succeed', () => {
  assert.deepEqual(
    summarizeGatewayRestart({
      sandboxMode: false,
      restartAttempted: true,
      restartSucceeded: false,
      gatewayRunning: false,
    }),
    {
      status: 'manual-restart-needed',
      userMessage: 'run openclaw gateway restart before opening the dashboard',
    },
  );
});
