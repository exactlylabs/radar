import {ReactElement, useEffect, useState} from "react";
import {GeospaceInfo, GeospaceOverview, isGeospaceData} from "../../../api/geospaces/types";
import {styles} from "./styles/FloatingPopover.style";
import {capitalize} from "../../../utils/strings";
import SpeedDataCell from "../RightPanel/SpeedDataCell";
import {SpeedFilters} from "../../../utils/filters";
import {
  getDownloadIconSrc,
  getSignalStateDownload,
  getSignalStateUpload,
  getUploadIconSrc
} from "../../../utils/speeds";
import WhiteRightArrow from '../../../assets/arrow-right.png';
import CustomFullWidthButton from "../../common/CustomFullWidthButton";
import {useMap} from "react-leaflet";
import L, {Point} from "leaflet";
import CloseIconBlack from "../../../assets/close-icon-gray.png";

interface FloatingPopoverProps {
  selectedGeospace: GeospaceInfo,
  viewAllDetails: () => void;
  speedType: string;
  center: Array<number>;
  zoom: number;
  closePopover: () => void;
}

const FloatingPopover = ({
  selectedGeospace,
  viewAllDetails,
  speedType,
  center,
  zoom,
  closePopover,
}: FloatingPopoverProps): ReactElement => {

  const map = useMap();
  const [point, setPoint] = useState<L.Point>(new Point(0, 0));
  const [latLng, setLatLng] = useState<L.LatLng>();

  useEffect(() => {
    const {geospace} = selectedGeospace as GeospaceOverview;
    const ll = L.latLng(geospace.centroid[0], geospace.centroid[1])
    setLatLng(ll);
    setPoint(map.latLngToContainerPoint(ll));
  }, [selectedGeospace]);

  useEffect(() => {
    if(latLng) setPoint(map.latLngToContainerPoint(latLng));
  }, [zoom, center])

  const getName = (): string => {
    if(isGeospaceData(selectedGeospace)) {
      if(selectedGeospace.state) return selectedGeospace.state as string;
      else return selectedGeospace.county as string;
    } else {
      const info: GeospaceOverview = selectedGeospace as GeospaceOverview;
      return info.geospace.name;
    }
  }

  const getCorrespondingSignalState = () => {
    return speedType === SpeedFilters.DOWNLOAD ?
      getSignalStateDownload(selectedGeospace.download_median) :
      getSignalStateUpload(selectedGeospace.upload_median);
  }

  const getCorrespondingIcon = (currentFilter: SpeedFilters) =>
    currentFilter === SpeedFilters.DOWNLOAD ?
      getDownloadIconSrc(speedType, getCorrespondingSignalState()) :
      getUploadIconSrc(speedType, getCorrespondingSignalState());


  return (
      <div style={styles.FloatingPopover(point)}>
        <img className={'hover-opaque'}
             src={CloseIconBlack}
             onClick={closePopover}
             style={styles.CloseIcon}
             alt={'close-icon'}
        />
        <div style={styles.Header}>
          <div style={styles.TextContainer}>
            <p className={'fw-medium'} style={styles.MainText}>{getName()}</p>
            <p className={'fw-light'} style={styles.SecondaryText}>{'U.S.A.'}</p>
          </div>
          <div style={styles.SignalStateContainer}>
            <div style={styles.SignalStateIndicator(getCorrespondingSignalState())}></div>
            <p className={'fw-regular'} style={styles.SignalStateText}>{capitalize(getCorrespondingSignalState())}</p>
          </div>
        </div>
        <div style={styles.SpeedDataContainer}>
          <SpeedDataCell icon={<img src={getCorrespondingIcon(SpeedFilters.DOWNLOAD)} style={styles.Icon(getCorrespondingSignalState())} alt={'download-icon'}/>}
                         text={'Med. Download'}
                         value={selectedGeospace.download_median.toFixed(2)}
                         unit={'Mbps'}
                         horizontalVersion
          />
          <SpeedDataCell icon={<img src={getCorrespondingIcon(SpeedFilters.UPLOAD)} style={styles.Icon()} alt={'upload-icon'}/>}
                         text={'Med. Upload'}
                         value={selectedGeospace.upload_median.toFixed(2)}
                         unit={'Mbps'}
                         horizontalVersion
          />
        </div>
        <div style={styles.ButtonContainer}>
          <CustomFullWidthButton text={'View all details'}
                                 icon={<img src={WhiteRightArrow} alt={'white arrow right'} style={styles.WhiteArrowRight}/>}
                                 onClick={viewAllDetails}
          />
        </div>
      </div>
  )
}

export default FloatingPopover;