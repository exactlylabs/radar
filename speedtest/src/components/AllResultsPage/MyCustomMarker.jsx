import {CircleMarker} from "react-leaflet";
import {
  DOWNLOAD_FILTER_TAGS,
  UPLOAD_FILTER_TAGS,
} from "../../utils/speeds";
import {
  DEFAULT_DOWNLOAD_FILTER_NONE,
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID
} from "../../utils/colors";
import MyPopup from "./MyPopup";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import {useContext} from "react";
import ConfigContext from "../../context/ConfigContext";
import L from 'leaflet';

const sharedMarkerProps = {
  stroke: true,
  weight: 1,
}

const MyCustomMarker = ({
  currentFilterType,
  measurement,
  recenterMap,
  setBottomFiltersVisible
}) => {

  const getPathOptions = () => {
    const { downloadFilterTag, uploadFilterTag } = measurement;
    let pathOptions = {
      ...sharedMarkerProps,
      opacity: 1.0,
      fillOpacity: 0.7,
    };
    const tagToCheck = currentFilterType === 'download' ? downloadFilterTag : uploadFilterTag;
    const thresholdToConsider = currentFilterType === 'download' ? DOWNLOAD_FILTER_TAGS : UPLOAD_FILTER_TAGS;
    if (tagToCheck === thresholdToConsider[0]) 
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_NONE,
        fillColor: DEFAULT_DOWNLOAD_FILTER_NONE,
      }
    else if (tagToCheck === thresholdToConsider[1])
      return {
        ...pathOptions,
        color: DEFAULT_DOWNLOAD_FILTER_LOW,
        fillColor: DEFAULT_DOWNLOAD_FILTER_LOW,
    };
    else if (tagToCheck === thresholdToConsider[2])
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

  if(!measurement.visible) return;

  const config = useContext(ConfigContext);

  const handleMarkerClick = (e) => {
    if(config.widgetMode) {
      setBottomFiltersVisible(false);
    }
    recenterMap([e.latlng.lat, e.latlng.lng]);
  }

  const handlePopupClose = () => { setBottomFiltersVisible(true) }

  return (
    <CircleMarker
      key={measurement.id}
      radius={6}
      center={[measurement.latitude , measurement.longitude]}
      pathOptions={getPathOptions()}
      eventHandlers={{
        click: handleMarkerClick,
        popupclose: handlePopupClose,
    }}
    >
      <MyPopup measurement={measurement}/>
    </CircleMarker>
  )
}

export default MyCustomMarker;