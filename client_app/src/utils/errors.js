import * as Sentry from '@sentry/react';

export const notifyError = err => Sentry.captureException(err);
