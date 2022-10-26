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
  mapTileUrl, outlineOnlyStyle,
  shouldShowLayer
} from "../../utils/map";
import {styles} from "./styles/MyMap.style";
import {GeoJSONFilters, GeoJSONProperties, GeoJSONResponse, GeoJSONTimedResponse} from "../../api/geojson/types";
import {getGeoJSON} from "../../api/geojson/requests";
import {handleError} from "../../api";
import {getSignalStateDownload, getSignalStateUpload, speedColors, SpeedsObject} from "../../utils/speeds";
import {GeospaceData, GeospaceInfo, GeospaceOverview} from "../../api/geospaces/types";
import {Filter, Optional} from "../../utils/types";
import ReactDOMServer from "react-dom/server";
import GeographicalTooltip from "./GeographicalTooltip/GeographicalTooltip";
import {Asn} from "../../api/asns/types";
import {BLACK} from "../../styles/colors";
import MySpinner from "../common/MySpinner";
import {dateTabs} from "../../utils/filters";
import {usePrev} from "../../hooks/usePrev";

const geoJSONOptions: L.GeoJSONOptions = {
  style: (feature) => {
    let style = baseStyle;
    if (feature) {
      const properties: GeoJSONProperties = feature.properties as GeoJSONProperties;
      if (properties.summary !== undefined) {
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
  isRightPanelHidden: boolean;
  lastGeoJSONUpdate: Date;
  dateQueryString?: string;
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
  zoom,
  isRightPanelHidden,
  lastGeoJSONUpdate,
  dateQueryString
}: CustomMapProps): null => {

  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap

  const prevSelectedGeospace = usePrev(selectedGeospace);

  useEffect(() => {
    map.attributionControl.setPrefix('');
    map.setMinZoom(3);
    map.zoomControl.setPosition('bottomright');
    map.on('zoomend', () => {
      const center: L.LatLng = map.getCenter();
      setZoom(map.getZoom());
      setCenter([center.lat, center.lng]);
    });
    map.on('dragend', () => {
      const center: L.LatLng = map.getCenter();
      setCenter([center.lat, center.lng]);
    });
  }, []);

  map.setView({lat: center[0], lng: center[1]}, zoom);

  useEffect(() => {
    const zoomControlElements: HTMLCollection = document.getElementsByClassName('leaflet-control-zoom');
    if(zoomControlElements.length > 0) {
      const firstElement: Element | null = zoomControlElements.item(0);
      // doing 2 line condition to prevent Typescript error
      if (firstElement) {
        if (!!selectedGeospace && !isRightPanelHidden) {
          firstElement.classList.add('leaflet-control-zoom-custom-position');
        } else {
          firstElement.classList.remove('leaflet-control-zoom-custom-position');
        }
      }
    }
    // check to see if we need to re-paint a shape is selected or unselected
    if((!!prevSelectedGeospace && !!selectedGeospace && (prevSelectedGeospace as GeospaceOverview).geospace.id !== (selectedGeospace as GeospaceOverview).geospace.id) ||
      (!prevSelectedGeospace && !!selectedGeospace) || (!!prevSelectedGeospace && !selectedGeospace)) {
      map.eachLayer((layer: any) => {
        if(layer.feature) {
          const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
          if(properties.summary !== undefined) {
            const isSelected: boolean = !!selectedGeospace ? isCurrentGeospace(properties.summary.geospace, selectedGeospace) : false;
            const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
            const shouldColorFill = shouldShowLayer(properties.summary, speedType, selectedSpeedFilters);
            layer.setStyle(getStyle(isSelected, key, shouldColorFill));
            if (!isSelected) {
              layer.removeEventListener('mouseout', layerMouseoutHandler);
              layer.removeEventListener('mouseover', layerMouseoverHandler);
              layer.addEventListener('mouseout', layerMouseoutHandler);
              layer.addEventListener('mouseover', layerMouseoverHandler);
            } else {
              layer.removeEventListener('mouseout', layerMouseoutHandler);
              layer.removeEventListener('mouseover', layerMouseoverHandler);
            }
          }
        }
      });
    }
  }, [selectedGeospace, isRightPanelHidden]);

  useEffect(() => {
    map.eachLayer((layer: any) => {
      if(layer.feature) {
        const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
        if(properties.summary !== undefined) {
          const isSelected: boolean = !!selectedGeospace ? isCurrentGeospace(properties.summary.geospace, selectedGeospace) : false;
          const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
          const shouldColorFill = shouldShowLayer(properties.summary, speedType, selectedSpeedFilters);
          layer.setStyle(getStyle(isSelected, key, shouldColorFill));
          layer.removeEventListener('mouseout', layerMouseoutHandler);
          layer.removeEventListener('mouseover', layerMouseoverHandler);
          if (!isSelected) {
            layer.addEventListener('mouseout', layerMouseoutHandler);
            layer.addEventListener('mouseover', layerMouseoverHandler);
          }
        }
      }
    });
  }, [speedType, selectedSpeedFilters, dateQueryString]);

  useEffect(() => {
    map.eachLayer((layer: any) => {
      if(layer.feature) {
        layer.remove();
      }
    });
    L.geoJSON(geoJSON, geoJSONOptions)
      .eachLayer((layer: any) => {
        if(layer.feature) {
          const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
          const shouldColorFill = shouldShowLayer(properties.summary, speedType, selectedSpeedFilters);
          if(properties.summary !== undefined) {
            const isSelected: boolean = !!selectedGeospace ? isCurrentGeospace(properties.summary.geospace, selectedGeospace) : false;
            layer.addEventListener('click', () => {
              if (properties.summary.geospace.name === 'Alaska') {
                // TODO: quick fix for Alaskan center wrongly calculated. From the internet, Alaska's center is at 64.2008° N, 149.4937° W
                const center: L.LatLng = L.latLng(64.2008, -149.4937);
                selectGeospace(layer.feature.properties.summary, center);
              } else {
                selectGeospace(layer.feature.properties.summary, layer.getBounds().getCenter());
              }
            });
            if (!isSelected) {
              layer.addEventListener('mouseout', layerMouseoutHandler);
              layer.addEventListener('mouseover', layerMouseoverHandler);
            }
            const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
            layer.setStyle(getStyle(isSelected, key, shouldColorFill));
            layer.bindTooltip(
              ReactDOMServer.renderToString(<GeographicalTooltip geospace={layer.feature.properties.summary} speedType={speedType as string}/>),
              {sticky: true, direction: 'center'}
            );
          } else {
            layer.setStyle(outlineOnlyStyle);
          }
        }
      })
      .addTo(map);
  }, [lastGeoJSONUpdate]);


  return null;
}

interface MyMapProps {
  namespace: string;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo, center: L.LatLng) => void;
  speedType: string;
  provider: Asn;
  calendarType: string;
  selectedSpeedFilters: Array<Filter>;
  initialZoom: number;
  setZoom: (zoom: number) => void;
  initialCenter: Array<number>;
  setCenter: (center: Array<number>) => void;
  setLoading: (value: boolean) => void;
  isRightPanelHidden: boolean;
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
  calendarType
}: MyMapProps): ReactElement => {

  const [geoJSON, setGeoJSON] = useState<GeoJSONTimedResponse>();

  useEffect(() => {
    setLoading(true);
    const filters: GeoJSONFilters = {
      speedType: speedType as string,
      calendar: calendarType as string,
      provider: provider as Asn,
    };
    getGeoJSON(namespace.toLowerCase(), filters)
      .then((res: GeoJSONResponse) => {
        setGeoJSON({ data: res, lastUpdate: new Date() });
      })
      .catch(err => { handleError(err); })
      .finally(() => setLoading(false));
  }, [namespace, calendarType, provider, speedType]);

  return (
    <>
      {
        geoJSON ?
        <MapContainer center={{lat: initialCenter[0], lng: initialCenter[1]}}
                    zoom={initialZoom}
                    scrollWheelZoom
                    style={styles.MapContainer}
        >
          <CustomMap geoJSON={geoJSON.data}
                     selectedGeospace={selectedGeospace}
                     selectGeospace={selectGeospace}
                     speedType={speedType}
                     selectedSpeedFilters={selectedSpeedFilters}
                     setZoom={setZoom}
                     setCenter={setCenter}
                     center={initialCenter}
                     zoom={initialZoom}
                     isRightPanelHidden={isRightPanelHidden}
                     lastGeoJSONUpdate={geoJSON.lastUpdate}
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