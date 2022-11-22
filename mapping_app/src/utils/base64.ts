import {AppState, Filter, isLatLngValid, isNumber, isString, Optional} from "./types";
import {Geospace, GeospaceInfo, isGeospaceData, isGeospaceOverview} from "../api/geospaces/types";
import {calendarFilters, speedFilters, tabs} from "./filters";
import {Asn, isAsn} from "../api/asns/types";
import {allProvidersElement} from "../components/ExplorePage/TopFilters/utils/providers";
import {speedTypes} from "./speeds";
import {handleError} from "../api";
import Option from "../components/ExplorePage/TopFilters/Option";

let appState: Optional<AppState>;

export const getAppState = (encoded: string): Optional<AppState> => {
  if(!encoded) return null;
  try {
    const decodedString: string = atob(encoded);
    return JSON.parse(decodedString) as AppState;
  } catch (e) {
    handleError(new Error(`Error getting app state from URL. Provided state string: ${encoded}`));
    return null; // by returning null, we force defaults
  }
}

export const updateUrl = (state: AppState): void => {
  const stringified: string = JSON.stringify(state);
  const encoded: string = btoa(stringified);
  window.history.replaceState(null, 'Broadband Mapping', `/explore?state=${encoded}`);
}

export const getValueFromUrl = (key: string): Optional<any> => {
  if(!appState) {
    const stateBase64: string = window.location.search.split('?state=')[1];
    appState = getAppState(stateBase64);
    if(!appState) return undefined;
  }
  appState = getValidState(appState as AppState);
  return appState[key as keyof AppState];
}

/**
 * Given the base64 encoded text could be tampered with, validate that there are
 * no wrong parameters to populate our state, and if there is, set them to their
 * corresponding default value
 * @param state: AppState
 * @return validState: AppState
 */
const getValidState = (state: AppState): AppState => {
  return {
    geospaceNamespace: validateAttribute('geospaceNamespace', state.geospaceNamespace) as string,
    speedType: validateAttribute('speedType', state.speedType) as string,
    calendarType: validateAttribute('calendarType', state.calendarType) as string,
    provider: validateAttribute('provider', state.provider) as Asn,
    selectedGeospace: validateAttribute('selectedGeospace', state.selectedGeospace) as Optional<GeospaceInfo>,
    selectedGeospaceId: validateAttribute('selectedGeospaceId', state.selectedGeospaceId) as string,
    selectedSpeedFilters: validateAttribute('selectedSpeedFilters', state.selectedSpeedFilters) as Array<string>,
    zoom: validateAttribute('zoom', state.zoom) as number,
    center: validateAttribute('center', state.center) as Array<number>,
  }
}

const validateAttribute = (key: string, value: any): any => {
  let returnValue: any;
  switch (key) {
    case 'geospaceNamespace':
      returnValue = validateGeospaceNamespace(value);
      break;
    case 'speedType':
      returnValue = validateSpeedType(value);
      break;
    case 'calendarType':
      returnValue = validateCalendarType(value);
      break;
    case 'provider':
      returnValue = validateProvider(value);
      break;
    case 'selectedGeospace':
      returnValue = validateSelectedGeospace(value);
      break;
    case 'selectedSpeedFilters':
      returnValue = validateSelectedSpeedFilters(value);
      break;
    case 'zoom':
      returnValue = validateZoom(value)
      break;
    case 'center':
      returnValue = validateCenter(value);
      break;
    case 'selectedGeospaceId':
      returnValue = validateGeospaceId(value);
      break;
    default:
      break;
  }
  return value;
}

const areAllValuesSpeedFilters = (value: any): boolean => {
  if(!Array.isArray(value)) return false;
  const arr: Array<any> = value as Array<any>;
  let hasInvalid: boolean = false;
  arr.forEach(elem => {
    if(elem !== speedTypes.UNSERVED &&
       elem !== speedTypes.UNDERSERVED &&
       elem !== speedTypes.SERVED)
      hasInvalid = true;
  });
  return !hasInvalid;
}

const validateGeospaceNamespace = (value: any): string => {
  if (!isString(value) || !Object.keys(tabs).includes(value as string)) return tabs.STATES;
  return value;
}

const validateSpeedType = (value: any): string => {
  if(!isString(value) || !(value as string in speedFilters)) return speedFilters.DOWNLOAD;
  return value;
}

const validateCalendarType = (value: any): string => {
  if(!isString(value) || !(value as string in calendarFilters)) return calendarFilters.THIS_YEAR;
  return value;
}

const validateProvider = (value: any): Asn => {
  if(!isAsn(value)) return allProvidersElement;
  return value;
}

const validateSelectedGeospace = (value: any): Optional<GeospaceInfo> => {
  if(!isGeospaceOverview(value) && !isGeospaceData(value)) return null;
  return value;
}

const validateSelectedSpeedFilters = (value: any): Optional<Array<string>> => {
  if(!areAllValuesSpeedFilters(value)) return null;
  return value;
}

const validateZoom = (value: any): Optional<number> => {
  if(!isNumber(value)) return null;
  if((value as number) < 3) return 3; // min zoom
  if((value as number) > 18) return 18; // max zoom
  return value;
}

const validateCenter = (value: any): Optional<Array<number>> => {
  if(!isLatLngValid(value)) return null;
  return value;
}

const validateGeospaceId = (value: any): Optional<string> => {
  if(!isString(value)) return null;
  return value;
}