// Strong type for handling Optionals the same way Java does it
// Could come in handy in the future when no _optional_ attribute
// can be defined such as { key?: string } for example in an API
// response type definition if the content could be null for any reason.
import {Asn} from "../api/asns/types";

export type Optional<T> = T | null | undefined;

export type InputText = string | undefined;

export enum SignalStates {
  UNSERVED = 'UNSERVED',
  UNDERSERVED = 'UNDERSERVED',
  SERVED = 'SERVED'
}

export type Filter = string | Asn;