import {useEffect} from "react";
import 'leaflet.vectorgrid';
// @ts-ignore
import vectorTileLayer from 'leaflet-vector-tile-layer';
import L, {LatLng, LeafletMouseEvent, VectorGrid} from "leaflet";
import {
  baseStyle, getCoordinates, getStyle, invisibleStyle,
  isCurrentGeospace,
  layerMouseoutHandler,
  layerMouseoverHandler,
  shouldShowLayer
} from "../../../utils/map";
import {GeoJSONProperties} from "../../../api/geojson/types";
import {getSignalStateDownload, getSignalStateUpload, speedColors, SpeedsObject} from "../../../utils/speeds";
import ReactDOMServer from "react-dom/server";
import GeographicalTooltip from "../GeographicalTooltip/GeographicalTooltip";
import {Filter, Optional} from "../../../utils/types";
import {Geospace, GeospaceInfo, GeospaceOverview} from "../../../api/geospaces/types";
import {useMap} from "react-leaflet";
import {vectorTilesUrl} from "../../../api/namespaces/requests";


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

const options: any = {
  style: (feature: any) => {
    let style = baseStyle;
    if(feature) {
      if(feature.properties?.summary !== undefined) {
        const summary: GeospaceOverview = JSON.parse(feature.properties.summary) as GeospaceOverview;
        style = {
          ...style,
          color: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject],
          fillColor: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject]
        }
      }
    }
    return style;
  }
}

interface CustomMapProps {
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo) => void;
  speedType: Filter;
  selectedSpeedFilters: Array<Filter>;
  namespace: string;
}

export const CustomMap = ({
  selectedGeospace,
  selectGeospace,
  speedType,
  selectedSpeedFilters,
  namespace
}: CustomMapProps): null => {

  useEffect(() => {
    //const vectorGridLayer: VectorGrid.Protobuf = L.vectorGrid.protobuf(vectorTilesUrl(namespace), protobufOptions);
    const vg = vectorTileLayer(vectorTilesUrl(namespace), options);
    if(!map.hasLayer(vg)) {
      map.addLayer(vg);
      // vector grid might get instantiated before the actual map layer, so it might overlap.
      // bringToFront() allows the layer to be on the very top of the layer stack.
      vg.bringToFront();
    }
    vg.on('click', (e: LeafletMouseEvent) => {
      if(e.propagatedFrom.feature) {
        const summary: GeospaceOverview = JSON.parse(e.propagatedFrom.feature.properties.summary) as GeospaceOverview;
        selectGeospace(summary);
      }
    });
    vg.on('mouseover', layerMouseoverHandler);
    vg.on('mouseout', layerMouseoutHandler);
  }, [namespace, speedType, selectedSpeedFilters]);


  useEffect(() => {
    map.eachLayer((l: any) => console.log(l));
  }, [selectedGeospace]);

  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  map.setMinZoom(3);
  map.zoomControl.setPosition('bottomright');
  /*map.eachLayer((layer: any) => {
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
    });*/
  return null;
}