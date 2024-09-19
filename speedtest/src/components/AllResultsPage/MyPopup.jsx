import {Popup} from "react-leaflet";
import {Point} from "leaflet/dist/leaflet-src.esm";
import './MyPopup.css';
import {
  DEFAULT_MAP_LEFT_ARROW_BORDER_COLOR,
  DEFAULT_MAP_POPUP_ADDRESS_SUBTITLE_COLOR,
  DEFAULT_MAP_POPUP_ADDRESS_TITLE_COLOR,
  DEFAULT_MAP_POPUP_HEADER_BACKGROUND_COLOR,
  DEFAULT_MAP_POPUP_FOOTER_BACKGROUND_COLOR
} from "../../utils/colors";
import DownloadIcon from '../../assets/small-download-icon.png';
import UploadIcon from '../../assets/small-upload-icon.png';
import LossIcon from '../../assets/loss-icon.png';
import LatencyIcon from '../../assets/latency-icon.png';
import ProviderIcon from '../../assets/provider-icon.png';
import MyPopupGridItem from "./MyPopupGridItem";
import {getNetworkPlacementIcon, placementOptions} from "../../utils/placements";
import {getNetworkTypeIcon, types} from "../../utils/networkTypes";

const popupOptions = {
  keepInView: false,
  closeButton: false,
  maxWidth: 285,
  offset: new Point(160, 240),
}

const popupOptionsWithFooter = {
  keepInView: false,
  closeButton: false,
  maxWidth: 285,
  offset: new Point(160, 230),
}

const emptyPopupOptions = {
  keepInView: false,
  closeButton: false,
  maxWidth: 285,
  offset: new Point(160, 140),
}

const popupOptionsWithHeader = {
  keepInView: false,
  closeButton: false,
  maxWidth: 285,
  offset: new Point(160, 200),
}

const popupDivStyle = {
  width: 275,
  position: 'relative',
}

const emptyPopupDivStyle = {
  width: 275,
  position: 'relative',
}

const halfPopupDivStyle = {
  width: 275,
  position: 'relative',
}

const popupHeaderStyle = {
  width: 'calc(100% - 30px)',
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

const popupFooterStyle = {
  width: 'calc(100% - 30px)',
  backgroundColor: DEFAULT_MAP_POPUP_FOOTER_BACKGROUND_COLOR,
  borderBottomLeftRadius: '12px',
  borderBottomRightRadius: '12px',
  display: 'flex',
  flexDirection: 'row',
  paddingTop: 10,
  paddingBottom: 10,
  paddingLeft: 15,
  paddingRight: 15,
  borderTop: 'solid 1px #e2e2e8',
  alignItems: 'center',
}

const emptyPopupHeaderStyle = {
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px',
  height: 0,
}

const halfPopupHeaderStyle = {
  width: 'calc(100% - 30px)',
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
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
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

const halfPopupContentContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  marginTop: 7,
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

const providerNameStyle = {
  fontSize: 14,
  color: DEFAULT_MAP_POPUP_ADDRESS_SUBTITLE_COLOR,
  marginLeft: 5,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}


// I'm attempting to refactor this component as little as possible considering we are
// gonna be progressively migrating from leaflet to maplibre-gl, and after that,
// we will introduce an entire new UI for the results map, so it's not really worth
// spending too much time and effort in getting this component clean now.
const MyPopup = ({measurement, provider = null}) => {

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
    if (!hasLocation && !hasType) return '0';
    if ((hasLocation && !hasType) || (!hasLocation && hasType)) return '15%';
    return '30%';
  }

  const getCityStateText = () => {
    if(!measurement.city && !measurement.state) return 'Not available';
    else if(!measurement.city) return measurement.state;
    else if(!measurement.state) return measurement.city;
    else return `${measurement.city}, ${measurement.state}`;
  }

  const getPopupHeaderStyle = () => {
    if((!measurement.street && (measurement.city || measurement.state)) ||
      (measurement.street && (!measurement.city && !measurement.state)))
      return halfPopupHeaderStyle;
    return popupHeaderStyle;
  }

  const getPopupDivStyle = () => {
    if(!measurement.street && !measurement.city && !measurement.state) return emptyPopupDivStyle;
    if((!measurement.street && (measurement.city || measurement.state)) ||
      (measurement.street && (!measurement.city && !measurement.state)))
      return halfPopupDivStyle;
    return popupDivStyle;
  }

  const getPopupOptions = () => {
    if((!measurement.street && !measurement.city && !measurement.state) && (!measurement.autonomous_system && !(measurement.autonomous_system?.autonomous_system_org))) {
      return emptyPopupOptions;
    }
    if(!measurement.autonomous_system && !(measurement.autonomous_system?.autonomous_system_org)) {
      return popupOptionsWithHeader;
    }
    if (!measurement.street && !measurement.city && !measurement.state) {
      return popupOptionsWithFooter;
    }
    return popupOptions
  }

  const getPopupContentContainerStyle = () => {
    if((!measurement.street && (measurement.city || measurement.state)) ||
      (measurement.street && (!measurement.city && !measurement.state)))
      return halfPopupContentContainerStyle;
    return popupContentContainerStyle;
  }

  const content = () => (
    <>
      <div style={leftPointingArrowStyle}></div>
      <div style={getPopupDivStyle()}>
        <div style={getPopupHeaderStyle()}>
          {(!!measurement.street || !!measurement.city || !!measurement.state) &&
            <div style={{...popupHeaderAddressContainerStyle, width: getAvailableWidth()}}>
              {!!measurement.street &&
                <div className={'speedtest--bold'} style={addressTitleStyle}>{measurement.street}</div>}
              {(!!measurement.city || !!measurement.state) &&
                <div style={addressSubtitleStyle}>{getCityStateText()}</div>}
            </div>
          }
          {
            (measurement.network_type || measurement.network_location) &&
            <div style={{...popupHeaderIconsContainerStyle, width: getIconsAvailableWidth()}}>
              {
                measurement.network_location &&
                <img src={getNetworkPlacementIcon(measurement.network_location, 'iconPopupSrc')} height={28} width={28}
                     alt={'popup-icon-location'} style={measurement.network_type ? leftIconStyle : null}/>
              }
              {
                measurement.network_type &&
                <img src={getNetworkTypeIcon(measurement.network_type, 'iconPopupSrc')} height={28} width={28}
                     alt={'popup-icon-location'}/>
              }
            </div>
          }
        </div>
        <div style={getPopupContentContainerStyle()}>
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
      {(measurement.autonomous_system && measurement.autonomous_system.autonomous_system_org) &&
        <div style={popupFooterStyle}>
          <img src={ProviderIcon} height={20} width={20} alt={'provider-icon'}/>
          <div className={'speedtest--bold'} style={providerNameStyle}>{measurement.autonomous_system.autonomous_system_org.name}</div>
        </div>
      }
    </>
  );

  return !provider ? <Popup {...getPopupOptions()}>{content()}</Popup> : <>{content()}</>;
}

export default MyPopup;