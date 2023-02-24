import * as Sentry from '@sentry/react';

export const notifyError = err => {
  if (REACT_APP_ENV === 'production') {
    Sentry.captureException(err);
  } else {
    console.error(err);
  }
};

export const isNoConnectionError = err => !!err.message && (err.message === 'Network request failed' || err.message === 'Failed to fetch');