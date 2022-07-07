import * as Sentry from '@sentry/react';

export const notifyError = err => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  } else {
    console.error(err);
  }
};
