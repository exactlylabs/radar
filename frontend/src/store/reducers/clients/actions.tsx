import { action } from 'typesafe-actions'
import { ClientsActionTypes, Client } from "./types";

export const fetchRequest = () => action(ClientsActionTypes.FETCH_REQUEST);
export const fetchSuccess = (data: Client[]) => action(ClientsActionTypes.FETCH_SUCCESS, data);
export const fetchError = (message: string) => action(ClientsActionTypes.FETCH_ERROR, message);
