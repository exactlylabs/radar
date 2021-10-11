export interface Client {
  id: string;
  name: string;
  address: string;
}

export enum ClientsActionTypes {
  FETCH_REQUEST = 'clients/FETCH_REQUEST',
  FETCH_SUCCESS = 'clients/FETCH_SUCCESS',
  FETCH_ERROR = 'clients/FETCH_ERROR'
}

export interface ClientsState {
  readonly loading: boolean;
  readonly data: Client[];
  readonly errors?: string;
}
