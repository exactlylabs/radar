import {ReactElement, useEffect, useState} from "react";
import L, {LatLng, LeafletMouseEvent} from "leaflet";
import {MapContainer, TileLayer, useMap} from "react-leaflet";
import {
  DEFAULT_FALLBACK_LATITUDE,
  DEFAULT_FALLBACK_LONGITUDE, getCoordinates, isCurrentGeospace,
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
import {
  getSignalStateDownload,
  getSignalStateUpload,
  speedColors,
  SpeedsObject,
  speedTypes
} from "../../utils/speeds";
import {GeospaceInfo} from "../../api/geospaces/types";
import {Optional} from "../../utils/types";
import ReactDOMServer from "react-dom/server";
import GeographicalTooltip from "./GeographicalTooltip/GeographicalTooltip";

const geoJSONOptions: L.GeoJSONOptions = {
  style: (feature) => {
    let style = {
      stroke: true,
      fill: true,
      opacity: 0.5,
      fillOpacity: 0.5,
      weight: 1,
      color: speedColors[speedTypes.UNSERVED as keyof SpeedsObject],
      fillColor: speedColors[speedTypes.UNSERVED as keyof SpeedsObject],
    };
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
  speedType: string;
  selectedSpeedFilters: Array<string>;
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
  // Limit map bounds to display only the US
  const topLeftBoundingPoint = L.latLng(72.901326, -175.464020);
  const bottomRightBoundingPoint = L.latLng(19.133341, -40.716708);
  const bounds = L.latLngBounds(topLeftBoundingPoint, bottomRightBoundingPoint);
  map.setMaxBounds(bounds);
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
        let style = {
          stroke: true,
          opacity: 0.5,
          fillOpacity: 0.5,
          weight: 1,
          color: speedColors[speedTypes.UNSERVED as keyof SpeedsObject],
          fillColor: speedColors[speedTypes.UNSERVED as keyof SpeedsObject],
        };
        const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
        if(properties.summary !== undefined &&
          shouldShowLayer(layer.feature.properties.summary, speedType, selectedSpeedFilters)) {
          const isSelected: boolean = !!selectedGeospace ? isCurrentGeospace(properties.summary.geospace, selectedGeospace) : false;
          layer.addEventListener('click', () => {
            selectGeospace(layer.feature.properties.summary);
          });
          if(!isSelected) {
            let timeoutId: NodeJS.Timeout;
            layer.addEventListener('mouseout', (ev: LeafletMouseEvent) => {
              let target = ev.target;
              clearTimeout(timeoutId);
              target.closeTooltip();
              target.setStyle({weight: 1, opacity: 0.5, fillOpacity: 0.5});
            });
            layer.addEventListener('mouseover', (ev: LeafletMouseEvent) => {
              let target = ev.target;
              target.setStyle({weight: 3, opacity: 0.8, fillOpacity: 0.8});
              target.closeTooltip();
              timeoutId = setTimeout(() => { target.openTooltip() }, 1000);
            });
          } else {
            const geospacePosition: LatLng = getCoordinates(layer.feature.geometry);
            map.flyTo(geospacePosition, 5);
            map.setView(geospacePosition, map.getZoom() > 5 ? map.getZoom() : 5);
          }
          const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
          style = {
            ...style,
            weight: isSelected ? 3 : style.weight,
            opacity: isSelected ? 0.8 : style.opacity,
            fillOpacity: isSelected ? 0.8 : style.fillOpacity,
            color: speedColors[key as keyof SpeedsObject],
            fillColor: speedColors[key as keyof SpeedsObject]
          }
          layer.setStyle(style);
        } else if (properties.summary !== undefined) {
          const key: string = speedType === 'Download' ? getSignalStateDownload(properties.summary.download_median) : getSignalStateUpload(properties.summary.upload_median);
          style = {
            ...style,
            opacity: 0,
            fillOpacity: 0,
            color: speedColors[key as keyof SpeedsObject],
            fillColor: speedColors[key as keyof SpeedsObject]
          }
          layer.setStyle(style);
        }
      }
    })
    .addTo(map);
  map.on('drag', () => { map.panInsideBounds(bounds, {animate: true}) });
  return null;
}

interface MyMapProps {
  namespace: string;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo) => void;
  speedType: string;
  selectedSpeedFilters: Array<string>;
}

const MyMap = ({
  namespace,
  selectedGeospace,
  selectGeospace,
  speedType,
  selectedSpeedFilters
}: MyMapProps): ReactElement => {

  const [geoJSON, setGeoJSON] = useState<GeoJSONResponse>();

  useEffect(() => {
    getGeoJSON(namespace)
      .then((res: GeoJSONResponse) => {
        setGeoJSON(res);
      })
      .catch(err => handleError(err));
  }, [namespace]);

  return (
    <>
      {
        geoJSON &&
        <MapContainer center={[DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
                    zoom={4}
                    scrollWheelZoom
                    style={styles.MapContainer}
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
        <div style={styles.SpinnerContainer}>
          <MySpinner color={BLACK} style={{width: '50px'}}/>
        </div>
      }
    </>
  )
}

export default MyMap;