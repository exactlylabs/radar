import {Popup} from "react-leaflet";
import {Point} from "leaflet/dist/leaflet-src.esm";
import './MyPopup.css';
import {
  DEFAULT_MAP_LEFT_ARROW_BORDER_COLOR,
  DEFAULT_MAP_POPUP_ADDRESS_SUBTITLE_COLOR,
  DEFAULT_MAP_POPUP_ADDRESS_TITLE_COLOR,
  DEFAULT_MAP_POPUP_HEADER_BACKGROUND_COLOR,
} from "../../utils/colors";
import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/loss-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import MyPopupGridItem from "./MyPopupGridItem";
import {placementOptions} from "../../utils/placements";
import {types} from "../../utils/networkTypes";

const popupOptions = {
  keepInView: false,
  closeButton: false,
  maxWidth: 285,
  maxHeight: 220,
  offset: new Point(160, 215),
}

const popupDivStyle = {
  width: 275,
  height: 220,
  position: 'relative',
}

const popupHeaderStyle = {
  width: 'calc(100% - 30px)',
  height: 45,
  backgroundColor: DEFAULT_MAP_POPUP_HEADER_BACKGROUND_COLOR,
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  display: 'flex',
  flexDirection: 'row',
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 15,
  paddingRight: 15,
  borderBottom: 'solid 1px #e2e2e8',
}

const popupHeaderAddressContainerStyle = {
  width: '70%',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const popupHeaderIconsContainerStyle = {
  width: '30%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
}

const popupContentContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  marginTop: 15,
}

const addressTitleStyle = {
  fontSize: 15,
  color: DEFAULT_MAP_POPUP_ADDRESS_TITLE_COLOR,
  marginBottom: 2,
  maxWidth: '95%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const addressSubtitleStyle = {
  fontSize: 14,
  color: DEFAULT_MAP_POPUP_ADDRESS_SUBTITLE_COLOR,
  maxWidth: '95%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const leftIconStyle = {
  marginRight: 10
}

const leftPointingArrowStyle = {
  width: 10,
  height: 10,
  transform: 'rotate(45deg)',
  position: 'absolute',
  top: 22,
  left: -6,
  backgroundColor: DEFAULT_MAP_POPUP_HEADER_BACKGROUND_COLOR,
  borderBottom: DEFAULT_MAP_LEFT_ARROW_BORDER_COLOR,
  borderLeft: DEFAULT_MAP_LEFT_ARROW_BORDER_COLOR
}

const MyPopup = ({
  measurement
}) => {

  const getAvailableWidth = () => {
    const hasLocation = measurement.network_location !== null;
    const hasType = measurement.network_type !== null;
    if(!hasLocation && !hasType) return '100%';
    if((hasLocation && !hasType) || (!hasLocation && hasType)) return '85%';
    return '70%';
  }

  const getIconsAvailableWidth = () => {
    const hasLocation = measurement.network_location !== null;
    const hasType = measurement.network_type !== null;
    if(!hasLocation && !hasType) return '0';
    if((hasLocation && !hasType) || (!hasLocation && hasType)) return '15%';
    return '30%';
  }

  const getNetworkLocationIcon = () => {
    const networkLocation = placementOptions.find(placement => placement.text === measurement.network_location);
    return networkLocation.iconPopupSrc;
  }

  const getNetworkTypeIcon = () => {
    const networkType = types.find(placement => placement.text === measurement.network_type);
    return networkType.iconPopupSrc;
  }

  return (
    <Popup {...popupOptions}>
      <div style={leftPointingArrowStyle}></div>
      <div style={popupDivStyle}>
        <div style={popupHeaderStyle}>
          <div style={{...popupHeaderAddressContainerStyle, width: getAvailableWidth()}}>
            <div className={'speedtest--bold'} style={addressTitleStyle}>{measurement.street}</div>
            <div style={addressSubtitleStyle}>{`${measurement.city}, ${measurement.state}`}</div>
          </div>
          {
            (measurement.network_type || measurement.network_location) &&
            <div style={{...popupHeaderIconsContainerStyle, width: getIconsAvailableWidth()}}>
              {
                measurement.network_location &&
                <img src={getNetworkLocationIcon()} height={28} width={28} alt={'popup-icon-location'} style={measurement.network_type ? leftIconStyle : null}/>
              }
              {
                measurement.network_type &&
                <img src={getNetworkTypeIcon()} height={28} width={28} alt={'popup-icon-location'}/>
              }
            </div>
          }
        </div>
        <div style={popupContentContainerStyle}>
          <MyPopupGridItem icon={DownloadIcon}
                           title={'Download'}
                           value={measurement.download_avg ? measurement.download_avg.toFixed(2) : '-'}
                           unit={'Mbps'}
          />
          <MyPopupGridItem icon={UploadIcon}
                           title={'Upload'}
                           value={measurement.upload_avg ? measurement.upload_avg.toFixed(2) : '-'}
                           unit={'Mbps'}
          />
          <MyPopupGridItem icon={LossIcon}
                           title={'Loss'}
                           value={measurement.loss !== null ? measurement.loss.toFixed(2) : '-'}
                           unit={'%'}
          />
          <MyPopupGridItem icon={LatencyIcon}
                           title={'Latency'}
                           value={measurement.latency !== null ? measurement.latency.toFixed(0) : '-'}
                           unit={'ms'}
          />
        </div>
      </div>
    </Popup>
  )
}

export default MyPopup;