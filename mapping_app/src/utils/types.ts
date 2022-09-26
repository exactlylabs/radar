// Strong type for handling Optionals the same way Java does it
// Could come in handy in the future when no _optional_ attribute
// can be defined such as { key?: string } for example in an API
// response type definition if the content could be null for any reason.
export type Optional<T> = T | null | undefined;

export type InputText = string | undefined;

export enum SignalStates {
  UNSERVED = 'UNSERVED',
  UNDERSERVED = 'UNDERSERVED',
  SERVED = 'SERVED'
}

export type SelectedAreaInfo = SelectedStateInfo | SelectedCountyInfo;

export type SelectedStateInfo = {
  name: string;
  country: string;
  signalState: SignalStates;
  medianDownload: number;
  medianUpload: number;
  medianLatency: number;
  unservedPeopleCount: number;
  underservedPeopleCount: number;
  servedPeopleCount: number;
}

// TODO: check if data is the same, just mocking for now
export type SelectedCountyInfo = {
  name: string;
  country: string;
  signalState: SignalStates;
  medianDownload: number;
  medianUpload: number;
  medianLatency: number;
  unservedPeopleCount: number;
  underservedPeopleCount: number;
  servedPeopleCount: number;
}