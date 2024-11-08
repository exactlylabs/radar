import { API_URL } from '../constants';
import { notifyError } from './errors';

export const getMaxCost = () => {
  return fetch(`${API_URL}/max_cost`)
    .then(res => {
      if(!res.ok) throw new Error('Error fetching max cost!');
      return res.json()
    });
}

export const persistContactData = (data, speedTestId) => {
  return fetch(`${API_URL}/speed_tests/${speedTestId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_email: data.email,
      client_phone: data.phone,
      client_first_name: data.firstName,
      client_last_name: data.lastName
    })
  })
    .then(res => {
      if(!res.ok) throw new Error('Error persisting contact data!');
      else return res.json();
    });
}

export const sendRawData = (rawData, startTimestamp, userData, clientId) => {
  const { networkLocation, networkType, networkCost, accuracy, altitude, addressProvider, altitudeAccuracy, speed, heading, expectedDownloadSpeed, expectedUploadSpeed, contactInformation } = userData;
  const { address, city, state, house_number, street, postal_code } = userData.address;
  const location = userData.address.coordinates;
  try {
    return fetch(`${API_URL}/speed_tests?client_id=${clientId}`, {
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
          heading,
          expected_download_speed: expectedDownloadSpeed,
          expected_upload_speed: expectedUploadSpeed,
          client_first_name: contactInformation.firstName,
          client_last_name: contactInformation.lastName,
          client_email: contactInformation.email,
          client_phone: contactInformation.phone
        }
      }),
    })
    .then(res => {
      if(!res.ok) throw new Error('Error creating new speed test!');
      return res.json();
    })
  } catch (e) {
    notifyError(e);
    throw new Error('Error saving speed test results. Please try again later.');
  }
};

export const sendSpeedTestFormInformation = async (userData, clientId) => {
  try {
    const emptySubmission = await sendRawData({}, new Date().toISOString(), userData, clientId);
    return emptySubmission.id;
  } catch (err) {
    notifyError(err);
    throw new Error(err);
  }
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