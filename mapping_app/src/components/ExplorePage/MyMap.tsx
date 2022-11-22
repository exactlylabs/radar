import {ReactElement, useEffect, useState} from "react";
import L from "leaflet";
import {MapContainer, TileLayer} from "react-leaflet";
import {baseStyle, mapTileAttribution, mapTileUrl} from "../../utils/map";
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
import {getSignalStateDownload, speedColors, SpeedsObject} from "../../utils/speeds";

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

  const options: any = {
    style: (feature: any) => {
      let style = baseStyle;
      if (feature) {
        const properties = feature.properties as UnparsedGeoJSONProperties;
        if (properties.summary !== undefined) {
          const summary: GeospaceOverview = JSON.parse(properties.summary) as GeospaceOverview;
          style = {
            ...style,
            color: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject],
            fillColor: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject]
          }
        }
      }
      return style;
    },
    getFeatureId: (feature: any) => {
      if(feature.properties?.summary !== undefined) {
        const summary: GeospaceOverview = JSON.parse(feature.properties.summary) as GeospaceOverview;
        return summary.geospace.geo_id;
      } else {
        return '';
      }
    }
  }

  useEffect(() => {
    setLoading(true);
    setTileLayer(vectorTileLayer(getVectorTilesUrl(namespace), options));
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
          <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
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