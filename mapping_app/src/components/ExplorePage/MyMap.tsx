import {ReactElement, useEffect, useState} from "react";
import L from "leaflet";
import {MapContainer, TileLayer, useMap} from "react-leaflet";
import {
  baseStyle,
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
import {GeoJSONFilters, GeoJSONProperties, GeoJSONResponse} from "../../api/geojson/types";
import {getGeoJSON} from "../../api/geojson/requests";
import {handleError} from "../../api";
import {getSignalStateDownload, getSignalStateUpload, speedColors, SpeedsObject} from "../../utils/speeds";
import {GeospaceInfo, GeospaceOverview} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import ReactDOMServer from "react-dom/server";
import GeographicalTooltip from "./GeographicalTooltip/GeographicalTooltip";
import {Asn} from "../../api/asns/types";
import {BLACK} from "../../styles/colors";
import MySpinner from "../common/MySpinner";

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
  }
}

interface CustomMapProps {
  geoJSON: GeoJSONResponse;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo, newCenter: L.LatLng) => void;
  speedType: Filter;
  selectedSpeedFilters: Array<Filter>;
  setZoom: (zoom: number) => void;
  setCenter: (center: Array<number>) => void;
  center: Array<number>;
  zoom: number;
}

const CustomMap = ({
  geoJSON,
  selectedGeospace,
  selectGeospace,
  speedType,
  selectedSpeedFilters,
  setZoom,
  setCenter,
  center,
  zoom
}: CustomMapProps): null => {
  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  map.setMinZoom(3);
  map.setView({lat: center[0], lng: center[1]}, zoom);
  map.zoomControl.setPosition('bottomright');
  map.eachLayer((layer: any) => {
    if(layer.feature) {
      layer.remove();
    }
  });
  map.on('zoomend', () => {
    const center: L.LatLng = map.getCenter();
    setZoom(map.getZoom());
    setCenter([center.lat, center.lng]);
  });
  map.on('dragend', () => {
    const center: L.LatLng = map.getCenter();
    setCenter([center.lat, center.lng]);
  });
  L.geoJSON(geoJSON, geoJSONOptions)
    .eachLayer((layer: any) => {
      if(layer.feature) {
        const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
        if(properties.summary !== undefined && shouldShowLayer(layer.feature.properties.summary, speedType, selectedSpeedFilters)) {
          const isSelected: boolean = !!selectedGeospace ? isCurrentGeospace(properties.summary.geospace, selectedGeospace) : false;
          layer.addEventListener('click', () => {
            if(properties.summary.geospace.name === 'Alaska') {
              // TODO: quick fix for Alaskan center wrongly calculated. From the internet, Alaska's center is at 64.2008° N, 149.4937° W
              const center: L.LatLng = L.latLng(64.2008, -149.4937);
              selectGeospace(layer.feature.properties.summary, center);
            } else {
              selectGeospace(layer.feature.properties.summary, layer.getBounds().getCenter());
            }
          });
          if(!isSelected) {
            layer.addEventListener('mouseout', layerMouseoutHandler);
            layer.addEventListener('mouseover', layerMouseoverHandler);
          } else {
            const geospacePosition: L.LatLng = layer.getBounds().getCenter();
            map.flyTo(geospacePosition, 5);
            map.setView(geospacePosition, map.getZoom() > 5 ? map.getZoom() : 5);
          }
          const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
          layer.setStyle(getStyle(isSelected, key));
          layer.bindTooltip(
            ReactDOMServer.renderToString(<GeographicalTooltip geospace={layer.feature.properties.summary} speedType={speedType as string}/>),
            {sticky: true, direction: 'center'}
          );
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
  selectGeospace: (geospace: GeospaceInfo, center: L.LatLng) => void;
  speedType: Filter;
  calendarType: Filter;
  provider: Filter;
  selectedSpeedFilters: Array<Filter>;
  initialZoom: number;
  setZoom: (zoom: number) => void;
  initialCenter: Array<number>;
  setCenter: (center: Array<number>) => void;
  setLoading: (value: boolean) => void;
}

const MyMap = ({
  namespace,
  selectedGeospace,
  selectGeospace,
  speedType,
  calendarType,
  provider,
  selectedSpeedFilters,
  initialZoom,
  setZoom,
  initialCenter,
  setCenter,
  setLoading,
}: MyMapProps): ReactElement => {

  const [geoJSON, setGeoJSON] = useState<GeoJSONResponse>();

  useEffect(() => {
    setLoading(true);
    const filters: GeoJSONFilters = {
      speedType: speedType as string,
      calendar: calendarType as string,
      provider: provider as Asn,
    };
    getGeoJSON(namespace.toLowerCase(), filters)
      .then((res: GeoJSONResponse) => {
        setGeoJSON(res);
      })
      .catch(err => handleError(err))
      .finally(() => setLoading(false));
  }, [namespace, calendarType, provider]);

  return (
    <>
      {
        geoJSON ?
        <MapContainer center={{lat: initialCenter[0], lng: initialCenter[1]}}
                    zoom={initialZoom}
                    scrollWheelZoom
                    style={styles.MapContainer}
        >
          <CustomMap geoJSON={geoJSON}
                     selectedGeospace={selectedGeospace}
                     selectGeospace={selectGeospace}
                     speedType={speedType}
                     selectedSpeedFilters={selectedSpeedFilters}
                     setZoom={setZoom}
                     setCenter={setCenter}
                     center={initialCenter}
                     zoom={initialZoom}
          />
          <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
        </MapContainer>
      :
        <div style={styles.SpinnerContainer}></div>
      }
    </>
  )
}

export default MyMap;