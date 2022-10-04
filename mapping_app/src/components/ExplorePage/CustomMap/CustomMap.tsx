import 'leaflet.vectorgrid';
import L, {LeafletMouseEvent, VectorGrid} from "leaflet";
import {baseStyle} from "../../../utils/map";
import {GeoJSONProperties} from "../../../api/geojson/types";
import {getSignalStateDownload, speedColors, SpeedsObject} from "../../../utils/speeds";
import ReactDOMServer from "react-dom/server";
import GeographicalTooltip from "../GeographicalTooltip/GeographicalTooltip";
import {Filter, Optional} from "../../../utils/types";
import {GeospaceInfo} from "../../../api/geospaces/types";
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

const protobufOptions: VectorGrid.ProtobufOptions = {
  rendererFactory: L.canvas.tile, // Much needed performance improvement to force rendering with Tile canvas instead of SVG
  vectorTileLayerStyles: { myLayer: baseStyle },
  interactive: true,
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
  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  map.setMinZoom(3);
  map.zoomControl.setPosition('bottomright');
  /*map.eachLayer((layer: any) => {
    if(layer.feature) {
      layer.remove();
    }
  });*/
  const vectorGridLayer = L.vectorGrid.protobuf(vectorTilesUrl(namespace), protobufOptions);
  map.addLayer(vectorGridLayer);
  // vector grid gets instantiated before the actual map layer, so it gets overlapped.
  // bringToFront() allows the layer to be on the very top of the layer stack.
  vectorGridLayer.bringToFront();
  vectorGridLayer.on('click', (e: LeafletMouseEvent) => {
    console.log(e.propagatedFrom)
    const properties: GeoJSONProperties = e.propagatedFrom.properties as GeoJSONProperties;
    console.log(properties)
    selectGeospace(properties.summary);
  })
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