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

export const speedTextsDownload: SpeedsObject = {
  UNSERVED: '<25 Mbps',
  UNDERSERVED: '25 - 100 Mbps',
  SERVED: '100+ Mbps'
}

export const speedTextsUpload: SpeedsObject = {
  UNSERVED: '<2 Mbps',
  UNDERSERVED: '2 - 20 Mbps',
  SERVED: '20+ Mbps'
}

export const speedColors: SpeedsObject = {
  UNSERVED: SPEED_UNSERVED,
  UNDERSERVED: SPEED_UNDERSERVED,
  SERVED: SPEED_NORMAL
}

export const getSignalStateDownload = (downloadMedian: number): string => {
  if(downloadMedian < 25) return speedTypes.UNSERVED;
  else if(downloadMedian >= 25 && downloadMedian < 100) return speedTypes.UNDERSERVED;
  else return speedTypes.SERVED;
}

export const getSignalStateUpload = (uploadMedian: number): string => {
  if(uploadMedian < 2) return speedTypes.UNSERVED;
  else if(uploadMedian >= 2 && uploadMedian < 20) return speedTypes.UNDERSERVED;
  else return speedTypes.SERVED;
}