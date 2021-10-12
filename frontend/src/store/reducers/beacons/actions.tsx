import { action } from 'typesafe-actions'
import { BeaconsActionTypes, Beacon } from './types';
import client from 'services/client';
import store from '../..';

export const fetchBeacons = async () => {
  try {
    store.dispatch(action(BeaconsActionTypes.FETCH_REQUEST));
    const beacons = await client.fetchBeacons();
    store.dispatch(action(BeaconsActionTypes.FETCH_SUCCESS, beacons));
  } catch (e) {
    store.dispatch(action(BeaconsActionTypes.FETCH_ERROR, e.toString()));
  }
}

export const addBeacon = async (id: string, secret: string, name: string, address: string) => {
  await client.addBeacon(id, secret, name, address);
  store.dispatch(action(BeaconsActionTypes.ADD, {id, name, address, online: true}))
}
