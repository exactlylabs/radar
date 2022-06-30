import {API_URL} from "../constants";
import {notifyError} from "./errors";

export const sendRawData = (rawData, location, startTimestamp) => {
  fetch(`${API_URL}/speed_tests`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      raw: rawData,
      location: location,
      timestamp: startTimestamp
    })
  })
    .catch(notifyError);
}

export const getGeocodedAddress = (formData, setLoading, setLocation) => {
  fetch(`${API_URL}/geocode`, {
    method: 'POST',
    body: formData,
  })
    .then(res => res.json())
    .then(res => {
      setLoading(false);
      setLocation(res);
    })
    .catch(err => {
      setLoading(false);
      notifyError(err);
    })
}

export const getAllSpeedTests = (setResults, setFilteredResults, setError, setLoading) => {
  fetch(`${API_URL}/speed_tests`)
    .then(res => res.json())
    .then(res => {
      setResults(res); setFilteredResults(res);
    })
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}