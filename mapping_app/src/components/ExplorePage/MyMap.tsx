import {ReactElement, useEffect, useState} from "react";
import {MapContainer, TileLayer} from "react-leaflet";
import {
  DEFAULT_FALLBACK_LATITUDE,
  DEFAULT_FALLBACK_LONGITUDE,
  mapTileAttribution,
  mapTileUrl,
} from "../../utils/map";
import {styles} from "./styles/MyMap.style";
import {GeoJSONResponse} from "../../api/geojson/types";
import {getGeoJSON} from "../../api/geojson/requests";
import {handleError} from "../../api";
import MySpinner from "../common/MySpinner";
import {BLACK} from "../../styles/colors";
import {GeospaceInfo} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import {Asn} from "../../api/asns/types";
import {CustomMap} from "./CustomMap/CustomMap";

interface MyMapProps {
  namespace: string;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo) => void;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
  selectedSpeedFilters: Array<Filter>;
}

const MyMap = ({
  namespace,
  selectedGeospace,
  selectGeospace,
  speedType,
  calendarType,
  provider,
  selectedSpeedFilters
}: MyMapProps): ReactElement => {

  const [geoJSON, setGeoJSON] = useState<GeoJSONResponse>();

  /*useEffect(() => {
    getGeoJSON(namespace, calendarType, provider as Asn)
      .then((res: GeoJSONResponse) => {
        setGeoJSON(res);
      })
      .catch(err => handleError(err));
  }, [namespace, calendarType, provider]);*/

  return (
    <>
      <MapContainer center={[DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
                  zoom={3}
                  scrollWheelZoom
                  style={styles.MapContainer()}
      >
        <CustomMap namespace={namespace}
                   selectedGeospace={selectedGeospace}
                   selectGeospace={selectGeospace}
                   speedType={speedType}
                   selectedSpeedFilters={selectedSpeedFilters}
        />
        <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
      </MapContainer>
      {
        /*
        !geoJSON &&
        <div style={styles.SpinnerContainer()}>
          <MySpinner color={BLACK} style={{width: '50px'}}/>
        </div>
        */
      }
    </>
  )
}

export default MyMap;