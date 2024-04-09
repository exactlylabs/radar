import {useEffect, useMemo, useState} from "react";
import {useMap} from "react-leaflet";
import 'leaflet-canvas-marker';
import L from "leaflet";
import {DOWNLOAD_FILTER_TAGS, UPLOAD_FILTER_TAGS} from "../../../utils/speeds";
import circleGray from '../../../assets/circle-gray.png';
import circlePurple from '../../../assets/circle-purple.png';
import circleOrange from '../../../assets/circle-orange.svg';
import circleRed from '../../../assets/circle-red.svg';

const EfficientMarkers = ({items, currentFilterType}) => {

  const map = useMap();

  useEffect(() => {
    if(!map || !items || items.length === 0) return;

    console.log(items.length)

    let canvasLayer = null;

    map.eachLayer((layer) => {
      if(layer._canvas) map.removeLayer(layer);
    });

    canvasLayer = L.canvasIconLayer({}).addTo(map);

    console.log(map);

    canvasLayer.addOnClickListener((e,data) => {
      const selectedId = e.originalEvent.target._leaflet_id;
      console.log(selectedId, data.length, data.map(item => item.data._leaflet_id));
    });

    let markers = [];
    items.forEach((item => {
      const {downloadFilterTag, uploadFilterTag} = item;
      const tagToCheck = currentFilterType === 'download' ? downloadFilterTag : uploadFilterTag;
      const icon = L.icon({
        iconUrl: getCorrectIconUrl(tagToCheck),
        iconSize: [11, 11],
        iconAnchor: [5, 5],
      });
      const marker = L.marker([item.latitude, item.longitude],
        {icon: icon}
      ).bindPopup("I Am " + item.id);
      markers.push(marker);
    }));

    canvasLayer.addLayers(markers);
  }, [items, currentFilterType]);

  function getCorrectIconUrl(tag){
    const thresholdToConsider = currentFilterType === 'download' ? DOWNLOAD_FILTER_TAGS : UPLOAD_FILTER_TAGS;
    if(tag === thresholdToConsider[0]) return circleGray;
    else if(tag === thresholdToConsider[1]) return circleRed;
    else if(tag === thresholdToConsider[2]) return circleOrange;
    else return circlePurple;
  }

  return null;
}

export default EfficientMarkers;