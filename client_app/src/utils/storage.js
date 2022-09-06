import { LOCAL_STORAGE_KEY } from '../constants';

export const getStoredValues = () => JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY))?.values ?? null;

export const getLastStoredValue = () => {
  const values = getStoredValues();
  return values !== null ? values[0] : null;
};

const setNewValues = newValues => window.localStorage.setItem(LOCAL_STORAGE_KEY, newValues);

const hasStoredData = () => window.localStorage.getItem(LOCAL_STORAGE_KEY) !== null;

export const storeRunData = data => {
  const newMeasurement = {
    timestamp: data.startTimestamp,
    download: data.downloadValue,
    upload: data.uploadValue,
    lat: data.location[0],
    long: data.location[1],
    ...data,
  };
  let values = [];
  if (hasStoredData()) {
    values = [...getStoredValues()];
  }
  values = [newMeasurement, ...values]; // prepend to have the array sorted since creation by date desc
  const newValues = JSON.stringify({ values });
  setNewValues(newValues);
};
