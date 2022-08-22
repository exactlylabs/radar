import { API_URL } from '../constants';
import { notifyError } from './errors';
import { DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE } from './map';

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

export const getGeocodedAddress = async (formData, setLoading, setError = null) => {
  let response;
  fetch(`${API_URL}/geocode`, {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
    .then(res => {
      if (res.length > 0) {
        response = { name: formData.get('address'), coordinates: res };
      } else {
        setError && setError(true);
        response = {
          name: formData.get('address'),
          coordinates: [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE],
        };
      }
    })
    .catch(err => {
      notifyError(err);
    })
    .finally(() => {
      setLoading(false);
    });
  return response;
};

export const getAllSpeedTests = (setResults, setFilteredResults, setError, setLoading) => {
  fetch(`${API_URL}/speed_tests`)
    .then(res => res.json())
    .then(res => {
      const cleanResults = res.filter(measurement => measurement.latitude && measurement.longitude);
      setResults(cleanResults);
      setFilteredResults(cleanResults);
    })
    .catch(err => {
      setError(err);
      notifyError(err);
    })
    .finally(() => setLoading(false));
};

export const getSuggestions = async addressString => {
  const formData = new FormData();
  formData.append('address', addressString);
  try {
    return await fetch(`${API_URL}/suggestions`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  } catch (e) {
    notifyError(e);
    // Just human-readable error for UI display
    throw new Error('Error fetching suggestions. Please try again later.');
  }
};

export const getAddressForCoordinates = async coordinates => {
  const formData = new FormData();
  formData.append('coordinates', coordinates);
  try {
    return fetch(`${API_URL}/coordinates`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  } catch (e) {
    notifyError(e);
    // Just human-readable error for UI display
    throw new Error('Error fetching address. Please try again later.');
  }
};
