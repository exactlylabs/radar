import {CircleMarker} from "react-leaflet";
import {
  DOWNLOAD_FILTER_TAGS,
  UPLOAD_FILTER_TAGS,
} from "../../utils/speeds";
import {
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID
} from "../../utils/colors";
import MyPopup from "./MyPopup";

const sharedMarkerProps = {
  stroke: true,
  weight: 1,
}

const MyCustomMarker = ({
  currentFilterType,
  measurement,
  recenterMap
}) => {

  const getPathOptions = () => {
    const { downloadFilterTag, uploadFilterTag, visible } = measurement;
    let pathOptions = {
      ...sharedMarkerProps,
      opacity: visible ? 1.0 : 0.2,
      fillOpacity: visible ? 0.7 : 0.1,
    };
    const tagToCheck = currentFilterType === 'download' ? downloadFilterTag : uploadFilterTag;
    const thresholdToConsider = currentFilterType === 'download' ? DOWNLOAD_FILTER_TAGS : UPLOAD_FILTER_TAGS;
    if (tagToCheck === thresholdToConsider[0])
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_LOW,
        fillColor: DEFAULT_DOWNLOAD_FILTER_LOW,
    };
    else if (tagToCheck === thresholdToConsider[1])
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_MID,
        fillColor: DEFAULT_DOWNLOAD_FILTER_MID
    };
    else return {
      ...pathOptions,
      color: DEFAULT_DOWNLOAD_FILTER_HIGH,
      fillColor: DEFAULT_DOWNLOAD_FILTER_HIGH
    };
  };

  return (
    <CircleMarker
      key={measurement.id}
      radius={6}
      center={[measurement.latitude , measurement.longitude]}
      pathOptions={getPathOptions()}
      eventHandlers={{
        click: (e) => recenterMap([e.latlng.lat, e.latlng.lng])
      }}
    >
      <MyPopup measurement={measurement}/>
    </CircleMarker>
  )
}

export default MyCustomMarker;