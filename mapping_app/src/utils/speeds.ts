import {SPEED_NORMAL, SPEED_UNDERSERVED, SPEED_UNSERVED} from "../styles/colors";
import DownloadIconGray from "../assets/download-icon-gray.png";
import DownloadIconUnserved from "../assets/download-icon-unserved.png";
import DownloadIconUnderserved from "../assets/download-icon-underserved.png";
import DownloadIconServed from "../assets/download-icon-served.png";
import UploadIconGray from "../assets/upload-icon-gray.png";
import UploadIconUnserved from "../assets/upload-icon-unserved.png";
import UploadIconUnderserved from "../assets/upload-icon-underserved.png";
import UploadIconServed from "../assets/upload-icon-served.png";

export type SpeedsObject = {
  UNSERVED: string;
  UNDERSERVED: string;
  SERVED: string;
}

export enum speedTypes {
  UNSERVED = 'UNSERVED',
  UNDERSERVED = 'UNDERSERVED',
  SERVED = 'SERVED',
}

export enum speedTextsDownload {
  UNSERVED = '<25 Mbps',
  UNDERSERVED = '25 - 100 Mbps',
  SERVED = '100+ Mbps'
}

export enum speedTextsUpload {
  UNSERVED = '<3 Mbps',
  UNDERSERVED = '3 - 20 Mbps',
  SERVED = '20+ Mbps'
}

// Here I use object over enum as JS/TS does not allow for dynamic
// string enums, so if we want to keep using the color variables
// we need the object pattern.
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
  if(uploadMedian < 3) return speedTypes.UNSERVED;
  else if(uploadMedian >= 3 && uploadMedian < 20) return speedTypes.UNDERSERVED;
  else return speedTypes.SERVED;
}

export const getDownloadIconSrc = (speedType: string, speedState: string) => {
  console.log(speedType, speedState);
  if(speedType !== 'Download') return DownloadIconGray;
  if(speedState === speedTypes.UNSERVED) return DownloadIconUnserved;
  else if(speedState === speedTypes.UNDERSERVED) return DownloadIconUnderserved;
  else return DownloadIconServed;
}

export const getUploadIconSrc = (speedType: string, speedState: string) => {
  if(speedType !== 'Upload') return UploadIconGray;
  if(speedState === speedTypes.UNSERVED) return UploadIconUnserved;
  else if(speedState === speedTypes.UNDERSERVED) return UploadIconUnderserved;
  else return UploadIconServed;
}