import * as Sentry from '@sentry/react';
import {Optional} from "../utils/types";

export const API_URL = REACT_APP_ENV === 'production' ?
  'https://api.mapping.exactlylabs.com/api/v1' :
  'https://api.mapping.staging.exactlylabs.com/api/v1';

export const handleError = (err: Error): void => {
  if(REACT_APP_ENV === 'production') {
    Sentry.captureException(err);
  } else {
    console.error(err);
  }
}

export type PaginationLinks = {
  next: Optional<string>;
  previous: Optional<string>;
}