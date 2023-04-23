import { API_URL } from '../constants';
import { notifyError } from './errors';

export const sendRawData = (rawData, startTimestamp, userData, clientId) => {
  const { networkLocation, networkType, networkCost, accuracy, altitude, addressProvider, altitudeAccuracy, speed, heading } = userData;
  const { address, city, state, house_number, street, postal_code } = userData.address;
  const location = userData.address.coordinates;
  fetch(`${API_URL}/speed_tests?client_id=${clientId}`, {
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
        altitude,
        accuracy,
        address_provider: addressProvider,
        alt_accuracy: altitudeAccuracy,
        speed,
        heading
      }
    }),
  }).catch(notifyError);
};

export const getSuggestions = async (addressString, clientId) => {
  const formData = new FormData();
  formData.append('address', addressString);
  formData.append('client_id', clientId);
  return fetch(`${API_URL}/suggestions`, {
    method: 'POST',
    body: formData,
  }).then(res => res.json());
};

export const getAddressForCoordinates = async (coordinates, clientId) => {
  const formData = new FormData();
  formData.append('coordinates', coordinates);
  formData.append('client_id', clientId);
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

export const getUserApproximateCoordinates = (clientId) => fetch(`${API_URL}/user_coordinates?client_id=${clientId}`).then(res => res.json());

export const getTestsWithBounds = (northEast, southWest, clientId, global) => {
  if(!northEast || !southWest) throw new Error('Missing bounds!');
  const params = `?${global ? 'global=true' : `client_id=${clientId}`}&sw_lat=${southWest.lat}&sw_lng=${southWest.lng}&ne_lat=${northEast.lat}&ne_lng=${northEast.lng}`;
  return fetch(`${API_URL}/tests_with_bounds${params}`).then(res => res.json());
}