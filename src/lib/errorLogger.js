const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate Sentry or LogRocket here
    // Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Error]', error, context);
  }
};

const logWarning = (message, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service
  } else {
    console.warn('[Warning]', message, context);
  }
};

export { logError, logWarning };
