const logError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate Sentry or LogRocket here
    // Sentry.captureException(error, { extra: context });
    // Silent in production
  } else {
    // Development only
    if (typeof console !== 'undefined' && console.error) {
      console.error('[Error]', error, context);
    }
  }
};

const logWarning = (message, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service
    // Silent in production
  } else {
    // Development only
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Warning]', message, context);
    }
  }
};

export { logError, logWarning };
