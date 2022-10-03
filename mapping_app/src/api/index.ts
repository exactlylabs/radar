import * as Sentry from '@sentry/react';

export const API_URL = 'https://api.mapping.exactlylabs.com/api/v1';

export const handleError = (err: Error): void => {
  if(REACT_APP_ENV === 'production') {
    Sentry.captureException(err);
  } else {
    console.error(err);
  }
}