import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../api/geospaces/types";

export const getGeospaceName = (geospace: GeospaceInfo): string => {
  if(isGeospaceData(geospace)) {
    if(geospace.state) return geospace.state as string;
    else return geospace.county as string;
  } else {
    const info: GeospaceOverview = geospace as GeospaceOverview;
    return info.geospace.name;
  }
}