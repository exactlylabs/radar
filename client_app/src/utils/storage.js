import { LOCAL_STORAGE_KEY } from '../constants';

export const storeRunData = data => {
  const currentValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  const newMeasurement = {
    timestamp: data.startTimestamp,
    download: data.downloadValue,
    upload: data.uploadValue,
    lat: data.location[0],
    long: data.location[1],
    loss: data.loss,
    latency: data.latency,
  };
  let values = [];
  if (currentValue) {
    const json = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
    values = [...json.values];
  }
  values = [newMeasurement, ...values]; // prepend to have the array sorted since creation by date desc
  const newValues = JSON.stringify({ values });
  window.localStorage.setItem(LOCAL_STORAGE_KEY, newValues);
};
