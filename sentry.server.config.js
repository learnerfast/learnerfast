// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4b8c5ca8a6ad338c48d020d91a8065a5@o4510223109586944.ingest.us.sentry.io/4510223115223040",
  debug: true,
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
  beforeSend(event) {
    if (event.request?.url?.includes('/api/auth/')) {
      console.log('[Sentry Auth Debug]', event);
    }
    return event;
  },
});
