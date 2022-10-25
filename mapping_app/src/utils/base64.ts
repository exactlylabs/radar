import {AppState, Filter, isLatLngValid, isNumber, isString, Optional} from "./types";
import {GeospaceInfo, isGeospaceData, isGeospaceOverview} from "../api/geospaces/types";
import {calendarFilters, speedFilters, tabs} from "./filters";
import {isAsn} from "../api/asns/types";
import {allProvidersElement} from "../components/ExplorePage/TopFilters/utils/providers";
import {speedTypes} from "./speeds";
import {handleError} from "../api";

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
  const stateBase64: string = window.location.search.split('?state=')[1];
  let possibleState: Optional<AppState> = getAppState(stateBase64);
  if(!possibleState) return undefined;
  possibleState = getValidState(possibleState as AppState);
  return possibleState[key as keyof AppState];
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
    speedType: validateAttribute('speedType', state.speedType) as Filter,
    calendarType: validateAttribute('calendarType', state.calendarType) as Filter,
    provider: validateAttribute('provider', state.provider) as Filter,
    selectedGeospace: validateAttribute('selectedGeospace', state.selectedGeospace) as Optional<GeospaceInfo>,
    selectedGeospaceId: validateAttribute('selectedGeospaceId', state.selectedGeospaceId) as string,
    selectedSpeedFilters: validateAttribute('selectedSpeedFilters', state.selectedSpeedFilters) as Array<Filter>,
    zoom: validateAttribute('zoom', state.zoom) as number,
    center: validateAttribute('center', state.center) as Array<number>,
  }
}

const validateAttribute = (key: string, value: any): any => {
  switch (key) {
    case 'geospaceNamespace':
      if(!isString(value) || !Object.keys(tabs).includes(value as string)) return tabs.STATES;
      break;
    case 'speedType':
      if(!isString(value) || !speedFilters.includes(value as string)) return speedFilters[0];
      break;
    case 'calendarType':
      if(!isString(value)) return calendarFilters[0];
      break;
    case 'provider':
      if(!isAsn(value)) return allProvidersElement;
      break;
    case 'selectedGeospace':
      if(!isGeospaceOverview(value) && !isGeospaceData(value)) return null;
      break;
    case 'selectedSpeedFilters':
      if(!areAllValuesSpeedFilters(value)) return null;
      break;
    case 'zoom':
      if(!isNumber(value)) return null;
      if((value as number) < 3) return 3; // min zoom
      if((value as number) > 18) return 18; // max zoom
      break;
    case 'center':
      if(!isLatLngValid(value)) return null;
      break;
    case 'selectedGeospaceId':
      if(!isString(value)) return null;
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