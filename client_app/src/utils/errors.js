import * as Sentry from '@sentry/react';

export const notifyError = err => {
  if (REACT_APP_ENV === 'production') {
    Sentry.captureException(err);
  } else {
    console.error(err);
  }
};
