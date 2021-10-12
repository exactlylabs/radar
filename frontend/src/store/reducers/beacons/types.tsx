export interface Beacon {
  id: string;
  name: string;
  address: string;
  online: boolean;
}

export enum BeaconsActionTypes {
  FETCH_REQUEST = 'beacons/FETCH_REQUEST',
  FETCH_SUCCESS = 'beacons/FETCH_SUCCESS',
  FETCH_ERROR = 'beacons/FETCH_ERROR',
  ADD = 'beacons/ADD'
}

export interface BeaconsState {
  readonly loading: boolean;
  readonly data: Beacon[];
  readonly errors?: string;
}
