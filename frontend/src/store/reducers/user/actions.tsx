import { action } from 'typesafe-actions'
import { UserActionTypes, User } from 'store/reducers/user/types';
import client from 'services/client';
import store from '../..';
import { fetchBeacons } from '../beacons/actions';

export const login = async (email, password) => {
  const token = await client.authenticate(email, password);
  window.localStorage.setItem('token', token.token);
  store.dispatch(action(UserActionTypes.LOGGED_IN, token));
}

export const continueSession = async () => {
  const token = window.localStorage.getItem('token');
  client.token = token;
  if (token) {
    store.dispatch(action(UserActionTypes.LOGGED_IN, { token }));

    await fetchBeacons();
  }
}

export const logout = () => {
  window.localStorage.removeItem('token');
  store.dispatch(action(UserActionTypes.LOGGED_OUT, {}));
}
