function summarizeGatewayRestart({ sandboxMode, restartAttempted, restartSucceeded, gatewayRunning }) {
  if (sandboxMode) {
    return {
      status: 'sandbox',
      userMessage: 'sandbox mode skips automatic gateway restart',
    };
  }

  if (restartAttempted && restartSucceeded && gatewayRunning) {
    return {
      status: 'restarted',
      userMessage: 'gateway restarted automatically',
    };
  }

  if (gatewayRunning) {
    return {
      status: 'running',
      userMessage: 'gateway is already running',
    };
  }

  return {
    status: 'manual-restart-needed',
    userMessage: 'run openclaw gateway restart before opening the dashboard',
  };
}

export { summarizeGatewayRestart };
