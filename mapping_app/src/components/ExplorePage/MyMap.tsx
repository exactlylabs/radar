import {ReactElement, useEffect, useState} from "react";
import L, {LatLng} from "leaflet";
import {MapContainer, TileLayer, useMap} from "react-leaflet";
import {
  baseStyle,
  DEFAULT_FALLBACK_LATITUDE,
  DEFAULT_FALLBACK_LONGITUDE,
  getCoordinates,
  getStyle,
  invisibleStyle,
  isCurrentGeospace,
  layerMouseoutHandler,
  layerMouseoverHandler,
  mapTileAttribution,
  mapTileUrl,
  shouldShowLayer
} from "../../utils/map";
import {styles} from "./styles/MyMap.style";
import {GeoJSONProperties, GeoJSONResponse} from "../../api/geojson/types";
import {getGeoJSON} from "../../api/geojson/requests";
import {handleError} from "../../api";
import MySpinner from "../common/MySpinner";
import {BLACK} from "../../styles/colors";
import {getSignalStateDownload, getSignalStateUpload, speedColors, SpeedsObject} from "../../utils/speeds";
import {GeospaceInfo} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import ReactDOMServer from "react-dom/server";
import GeographicalTooltip from "./GeographicalTooltip/GeographicalTooltip";
import {Asn} from "../../api/asns/types";

const geoJSONOptions: L.GeoJSONOptions = {
  style: (feature) => {
    let style = baseStyle;
    if(feature) {
      const properties: GeoJSONProperties = feature.properties as GeoJSONProperties;
      if(properties.summary !== undefined) {
        style = {
          ...style,
          color: speedColors[getSignalStateDownload(properties.summary.download_median) as keyof SpeedsObject],
          fillColor: speedColors[getSignalStateDownload(properties.summary.download_median) as keyof SpeedsObject]
        }
      }
    }
    return style;
  },
  onEachFeature: (feature, layer) => {
    if(feature.properties.summary) {
      layer.bindTooltip(
        ReactDOMServer.renderToString(<GeographicalTooltip geospace={feature.properties.summary}/>),
        {sticky: true, direction: 'center'}
      );
    }
  }
}

interface CustomMapProps {
  geoJSON: GeoJSONResponse;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo) => void;
  speedType: Filter;
  selectedSpeedFilters: Array<Filter>;
}

const CustomMap = ({
  geoJSON,
  selectedGeospace,
  selectGeospace,
  speedType,
  selectedSpeedFilters
}: CustomMapProps): null => {
  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  map.setMinZoom(3);
  map.zoomControl.setPosition('bottomright');
  map.eachLayer((layer: any) => {
    if(layer.feature) {
      layer.remove();
    }
  });
  L.geoJSON(geoJSON, geoJSONOptions)
    .eachLayer((layer: any) => {
      if(layer.feature) {
        const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
        if(properties.summary !== undefined && shouldShowLayer(layer.feature.properties.summary, speedType, selectedSpeedFilters)) {
          const isSelected: boolean = !!selectedGeospace ? isCurrentGeospace(properties.summary.geospace, selectedGeospace) : false;
          layer.addEventListener('click', () => { selectGeospace(layer.feature.properties.summary); });
          if(!isSelected) {
            layer.addEventListener('mouseout', layerMouseoutHandler);
            layer.addEventListener('mouseover', layerMouseoverHandler);
          } else {
            const geospacePosition: LatLng = getCoordinates(layer.feature.geometry);
            map.flyTo(geospacePosition, 5);
            map.setView(geospacePosition, map.getZoom() > 5 ? map.getZoom() : 5);
          }
          const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
          layer.setStyle(getStyle(isSelected, key));
        } else if (properties.summary !== undefined) {
          layer.setStyle(invisibleStyle);
        }
      }
    })
    .addTo(map);
  return null;
}

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

  useEffect(() => {
    getGeoJSON(namespace, calendarType, provider as Asn)
      .then((res: GeoJSONResponse) => {
        setGeoJSON(res);
      })
      .catch(err => handleError(err));
  }, [namespace, calendarType, provider]);

  return (
    <>
      {
        geoJSON &&
        <MapContainer center={[DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
                    zoom={3}
                    scrollWheelZoom
                    style={styles.MapContainer()}
        >
          <CustomMap geoJSON={geoJSON}
                     selectedGeospace={selectedGeospace}
                     selectGeospace={selectGeospace}
                     speedType={speedType}
                     selectedSpeedFilters={selectedSpeedFilters}
          />
          <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
        </MapContainer>
      }
      {
        !geoJSON &&
        <div style={styles.SpinnerContainer()}>
          <MySpinner color={BLACK} style={{width: '50px'}}/>
        </div>
      }
    </>
  )
}

export default MyMap;