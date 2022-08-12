import { API_URL } from '../constants';
import { notifyError } from './errors';
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE} from "./map";

export const sendRawData = (rawData, location, startTimestamp) => {
  fetch(`${API_URL}/speed_tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      result: { raw: rawData },
      location: location,
      timestamp: startTimestamp,
    }),
  }).catch(notifyError);
};

export const getGeocodedAddress = (formData, setLoading, setLocation, setError = null) => {
  fetch(`${API_URL}/geocode`, {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
    .then(res => {
      if(res.length > 0) {
        setLocation(res);
      } else {
        setError && setError(true);
        setLocation([DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]);
      }
    })
    .catch(err => {
      notifyError(err);
    })
    .finally(() => setLoading(false));
};

export const getAllSpeedTests = (setResults, setFilteredResults, setError, setLoading) => {
  fetch(`${API_URL}/speed_tests`)
    .then(res => res.json())
    .then(res => {
      setResults(res);
      setFilteredResults(res);
    })
    .catch(err => {
      setError(err);
      notifyError(err);
    })
    .finally(() => setLoading(false));
};
