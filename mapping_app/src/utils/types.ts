// Strong type for handling Optionals the same way Java does it
// Could come in handy in the future when no _optional_ attribute
// can be defined such as { key?: string } for example in an API
// response type definition if the content could be null for any reason.
import {Asn} from "../api/asns/types";
import {GeospaceInfo} from "../api/geospaces/types";

export type Optional<T> = T | null | undefined;

export type InputText = string | undefined;

export enum SignalStates {
  UNSERVED = 'UNSERVED',
  UNDERSERVED = 'UNDERSERVED',
  SERVED = 'SERVED'
}

export type Filter = string | Asn;

export type AppState = {
  geospaceNamespace: string;
  speedType: string;
  calendarType: string;
  provider: Asn;
  selectedGeospace: Optional<GeospaceInfo>;
  selectedSpeedFilters: Array<string>;
  zoom: number;
  center: Array<number>;
  selectedGeospaceId: Optional<string>;
}

export const isLatLngValid = (value: any): boolean => {
  if(!Array.isArray(value)) return false;
  const arr: Array<any> = value as Array<any>;
  if(arr.length !== 2) return false;
  return isNumber(arr[0]) && isNumber(arr[1]);
}

export const isNumber = (value: any): boolean => {
  return typeof value === 'number' && !isNaN(value as number) && isFinite(value as number);
}

export const isString = (value: any): boolean => {
  return typeof value === 'string';
}