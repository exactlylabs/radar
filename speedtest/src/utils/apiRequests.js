import { API_URL } from '../constants';
import { notifyError } from './errors';
import { DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE } from './map';
import { getFilterTag } from './speeds';

export const sendRawData = (rawData, startTimestamp, userStepData, clientId) => {
  const { networkLocation, networkType, networkCost } = userStepData;
  const { address, city, state, house_number, street, postal_code } = userStepData.address;
  const location = userStepData.address.coordinates;
  fetch(`${API_URL}/speed_tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      result: { raw: rawData },
      speed_test: {
        latitude: location[0],
        longitude: location[1],
        tested_at: startTimestamp,
        address,
        city,
        street,
        state,
        postal_code,
        house_number,
        network_location: networkLocation?.text ?? null,
        network_type: networkType?.text ?? null,
        network_cost: networkCost,
      },
      client_id: clientId,
    }),
  }).catch(notifyError);
};

export const getGeocodedAddress = async (formData, setLoading) => {
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
        response = {
          name: formData.get('address'),
          coordinates: [DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE],
        };
      }
    })
    .catch(err => {
      notifyError(err);
      throw new Error('Error fetching address. Please try again later.');
    })
    .finally(() => {
      setLoading(false);
    });
  return response;
};

export const getSuggestions = async addressString => {
  const formData = new FormData();
  formData.append('address', addressString);
  return fetch(`${API_URL}/suggestions`, {
    method: 'POST',
    body: formData,
  }).then(res => res.json());
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

export const getUserApproximateCoordinates = () => fetch(`${API_URL}/user_coordinates`).then(res => res.json());

export const getTestsWithBounds = (northEast, southWest, clientId) => {
  if(!northEast || !southWest) throw new Error('Missing bounds!');
  const params = `?client_id=${clientId}&sw_lat=${southWest.lat}&sw_lng=${southWest.lng}&ne_lat=${northEast.lat}&ne_lng=${northEast.lng}`;
  return fetch(`${API_URL}/tests_with_bounds${params}`).then(res => res.json());
}