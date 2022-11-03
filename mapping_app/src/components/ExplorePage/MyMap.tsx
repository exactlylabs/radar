import {ReactElement, useEffect, useState} from "react";
import L from "leaflet";
import {MapContainer, TileLayer} from "react-leaflet";
import { mapTileAttribution, mapTileUrl} from "../../utils/map";
import {styles} from "./styles/MyMap.style";
import {GeoJSONResponse, GeoJSONTimedResponse} from "../../api/geojson/types";
import {getGeoJSON} from "../../api/geojson/requests";
import {handleError} from "../../api";
import {GeospaceInfo} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import {Asn} from "../../api/asns/types";
import CustomMap from "./CustomMap/CustomMap";
import {useViewportSizes} from "../../hooks/useViewportSizes";

interface MyMapProps {
  namespace: string;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo, center: L.LatLng) => void;
  speedType: Filter;
  provider: Filter;
  selectedSpeedFilters: Array<Filter>;
  initialZoom: number;
  setZoom: (zoom: number) => void;
  initialCenter: Array<number>;
  setCenter: (center: Array<number>) => void;
  setLoading: (value: boolean) => void;
  isRightPanelHidden: boolean;
  dateQueryString?: string;
}

const MyMap = ({
  namespace,
  selectedGeospace,
  selectGeospace,
  speedType,
  provider,
  selectedSpeedFilters,
  initialZoom,
  setZoom,
  initialCenter,
  setCenter,
  setLoading,
  isRightPanelHidden,
  dateQueryString,
}: MyMapProps): ReactElement => {

  const {isSmallerThanMid} = useViewportSizes();

  const [geoJSON, setGeoJSON] = useState<GeoJSONTimedResponse>();

  useEffect(() => {
    setLoading(true);
    getGeoJSON(namespace.toLowerCase(), provider as Asn, dateQueryString)
      .then((res: GeoJSONResponse) => {
        setGeoJSON({ data: res, lastUpdate: new Date() });
      })
      .catch(err => { handleError(err); })
      .finally(() => setLoading(false));
  }, [namespace, provider, dateQueryString]);

  return (
    <>
      {
        geoJSON &&
        <MapContainer center={{lat: initialCenter[0], lng: initialCenter[1]}}
                    zoom={initialZoom}
                    scrollWheelZoom
                    style={styles.MapContainer(isSmallerThanMid)}
        >
          <CustomMap geoJSON={geoJSON.data}
                     selectedGeospace={selectedGeospace}
                     selectGeospace={selectGeospace}
                     speedType={speedType}
                     selectedSpeedFilters={selectedSpeedFilters}
                     dateQueryString={dateQueryString}
                     setZoom={setZoom}
                     setCenter={setCenter}
                     center={initialCenter}
                     zoom={initialZoom}
                     isRightPanelHidden={isRightPanelHidden}
                     lastGeoJSONUpdate={geoJSON.lastUpdate}
          />
          <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
        </MapContainer>
      }
      {
        !geoJSON &&
        <div style={styles.SpinnerContainer}></div>
      }
    </>
  )
}

export default MyMap;