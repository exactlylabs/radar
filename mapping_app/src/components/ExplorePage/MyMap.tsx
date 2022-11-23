import {ReactElement, useEffect, useState} from "react";
import L from "leaflet";
import {MapContainer, TileLayer} from "react-leaflet";
import {
  baseStyle, getFeatureIdHandler,
  getStyle, getVectorTileOptions,
  isCurrentGeospace,
  mapTileAttribution,
  mapTileUrl,
  parseStringIntoCorrectNumber, featureStyleHandler,
  shouldShowLayer
} from "../../utils/map";
import {styles} from "./styles/MyMap.style";
import {
  GeoJSONProperties,
  GeoJSONResponse,
  GeoJSONTimedResponse,
  UnparsedGeoJSONProperties
} from "../../api/geojson/types";
import {getGeoJSON} from "../../api/geojson/requests";
import {handleError} from "../../api";
import {GeospaceInfo, GeospaceOverview} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import {Asn} from "../../api/asns/types";
import CustomMap from "./CustomMap/CustomMap";
import {useViewportSizes} from "../../hooks/useViewportSizes";
// @ts-ignore
import vectorTileLayer from 'leaflet-vector-tile-layer';
import {getVectorTilesUrl} from "../../api/tiles/requests";
import {getSignalState, getSignalStateDownload, speedColors, SpeedsObject} from "../../utils/speeds";
import {speedFilters} from "../../utils/filters";

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

  const {isSmallScreen, isTabletScreen} = useViewportSizes();
  const isSmallMap = isSmallScreen || isTabletScreen;

  const [tileLayer, setTileLayer] = useState(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    setLoading(true);
    setTileLayer(
      vectorTileLayer(
        getVectorTilesUrl(namespace, dateQueryString, provider as Asn),
        getVectorTileOptions(selectedGeospace, speedType, selectedSpeedFilters)
      )
    );
    setLastUpdate(new Date());
    setLoading(false);
  }, [namespace, provider, dateQueryString]);

  return (
    <>
      {
        tileLayer &&
        <MapContainer center={{lat: initialCenter[0], lng: initialCenter[1]}}
                    zoom={initialZoom}
                    scrollWheelZoom
                    style={styles.MapContainer(isSmallMap)}
        >
          <CustomMap selectedGeospace={selectedGeospace}
                     selectGeospace={selectGeospace}
                     speedType={speedType}
                     selectedSpeedFilters={selectedSpeedFilters}
                     dateQueryString={dateQueryString}
                     setZoom={setZoom}
                     setCenter={setCenter}
                     center={initialCenter}
                     zoom={initialZoom}
                     isRightPanelHidden={isRightPanelHidden}
                     lastGeoJSONUpdate={lastUpdate}
                     vectorTileLayer={tileLayer}
          />
        </MapContainer>
      }
      {
        !tileLayer &&
        <div style={styles.SpinnerContainer}></div>
      }
    </>
  )
}

export default MyMap;