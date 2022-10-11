import 'leaflet.vectorgrid';
import L, {LeafletMouseEvent, VectorGrid} from "leaflet";
import {baseStyle} from "../../../utils/map";
import {GeoJSONProperties} from "../../../api/geojson/types";
import {getSignalStateDownload, speedColors, SpeedsObject} from "../../../utils/speeds";
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

const protobufOptions: VectorGrid.ProtobufOptions = {
  rendererFactory: L.canvas.tile, // Much needed performance improvement to force rendering with Tile canvas instead of SVG
  vectorTileLayerStyles: { myLayer: baseStyle },
  interactive: true,
  getFeatureId: (feature: any): string => {
    const summary: GeospaceOverview = JSON.parse(feature.properties.summary) as GeospaceOverview;
    // ids that start with 0 will then be wrongly parsed as an integer without the zero.
    return summary.geospace.geo_id[0] === '0' ? summary.geospace.geo_id.substring(1) : summary.geospace.geo_id;
  },
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
  map.eachLayer(l => {
    let c: VectorGrid.Protobuf = l as VectorGrid.Protobuf;
    if(c.options.rendererFactory === L.canvas.tile && !c.isLoading()) {
      l.remove();
    }
  });
  const vectorGridLayer: VectorGrid.Protobuf = L.vectorGrid.protobuf(vectorTilesUrl(namespace), protobufOptions);
  if(!map.hasLayer(vectorGridLayer)) {
    map.addLayer(vectorGridLayer);
    // vector grid might get instantiated before the actual map layer, so it might overlap.
    // bringToFront() allows the layer to be on the very top of the layer stack.
    vectorGridLayer.bringToFront();
    vectorGridLayer.on('click', (e: LeafletMouseEvent) => {
      const properties: GeoJSONProperties = e.propagatedFrom.properties as GeoJSONProperties;
      selectGeospace(properties.summary);
    });
    vectorGridLayer.on('mouseover', (e: LeafletMouseEvent) => {
      const properties: GeoJSONProperties = e.propagatedFrom.properties as GeoJSONProperties;
      const summary: GeospaceOverview = JSON.parse(e.propagatedFrom.properties.summary) as GeospaceOverview;
      console.log(summary.geospace.geo_id)
      vectorGridLayer.setFeatureStyle(parseInt(summary.geospace.geo_id), {...baseStyle, fillOpacity: 1})
    });
    vectorGridLayer.on('mouseout', (e: LeafletMouseEvent) => {
      const properties: GeoJSONProperties = e.propagatedFrom.properties as GeoJSONProperties;
      const summary: GeospaceOverview = JSON.parse(e.propagatedFrom.properties.summary) as GeospaceOverview;
      console.log(summary.geospace.geo_id)
      vectorGridLayer.setFeatureStyle(parseInt(summary.geospace.geo_id), {...baseStyle, fillOpacity: baseStyle.fillOpacity})
    });
  }
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