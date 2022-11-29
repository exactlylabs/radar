import * as amplitude from "@amplitude/analytics-browser";
import {Environment} from "./env";

export enum AmplitudeEvent {
  PAGE_VISITED = 'Page visited',
  GEOSPACE_SELECTED = 'Geospace selected',
}

export const initializeAmplitudeEnvironment = () => {
  amplitude.init(AMPLITUDE_KEY);
}

export const trackAmplitudeEvent = (eventType: AmplitudeEvent, params?: any) => {
  if(REACT_APP_ENV !== Environment.PRODUCTION) return;
  switch (eventType) {
    case AmplitudeEvent.PAGE_VISITED:
      trackPageVisited();
      break;
    case AmplitudeEvent.GEOSPACE_SELECTED:
      trackGeospaceSelected(params.geospaceName);
      break;
  }
}

const trackPageVisited = () => amplitude.track(AmplitudeEvent.PAGE_VISITED);

const trackGeospaceSelected = (geospaceName: string) => {
  amplitude.track(AmplitudeEvent.GEOSPACE_SELECTED, {geospaceName});
}
