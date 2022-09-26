import {SPEED_NORMAL, SPEED_UNDERSERVED, SPEED_UNSERVED} from "../styles/colors";

export type SpeedsObject = {
  UNSERVED: string;
  UNDERSERVED: string;
  SERVED: string;
}

export const speedTypes: SpeedsObject = {
  UNSERVED: 'UNSERVED',
  UNDERSERVED: 'UNDERSERVED',
  SERVED: 'SERVED',
}

export const speedColors: SpeedsObject = {
  UNSERVED: SPEED_UNSERVED,
  UNDERSERVED: SPEED_UNDERSERVED,
  SERVED: SPEED_NORMAL
}

export const speedTexts: SpeedsObject = {
  UNSERVED: '<25 Mbps',
  UNDERSERVED: '25 - 100 Mbps',
  SERVED: '100+ Mbps'
}