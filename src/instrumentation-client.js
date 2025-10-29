// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4b8c5ca8a6ad338c48d020d91a8065a5@o4510223109586944.ingest.us.sentry.io/4510223115223040",
  debug: true,
  integrations: [
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
  beforeSend(event) {
    if (event.request?.url?.includes('/api/auth/') || window.location.hostname.includes('learnerfast.com')) {
      console.log('[Sentry Subdomain Auth Debug]', event);
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;