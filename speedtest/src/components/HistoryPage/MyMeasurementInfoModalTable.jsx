import {
  BLACK, DEFAULT_CIRCULAR_ICON_BG_COLOR,
  DEFAULT_MODAL_INFO_TABLE_COLOR,
  DEFAULT_POPUP_VALUE_COLOR,
  DEFAULT_STATS_TABLE_VERTICAL_DIVIDER_COLOR
} from "../../utils/colors";
import {types} from "../../utils/networkTypes";
import {placementOptions} from "../../utils/placements";
import LocationIcon from '../../assets/address-icon-blue.png';
import {useViewportSizes} from "../../hooks/useViewportSizes";

const tableStyle = {
  width: '90%',
  height: 90,
  backgroundColor: DEFAULT_MODAL_INFO_TABLE_COLOR,
  margin: '20px auto 30px',
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  position: 'relative',
}

const xsTableStyle = {
  ...tableStyle,
  margin: '5px auto',
}

const addressRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '90%',
}

const locationIconContainerStyle = {
  width: 28,
  height: 28,
  backgroundColor: DEFAULT_CIRCULAR_ICON_BG_COLOR,
  borderRadius: '50%',
  marginRight: 8,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const ellipsisStyle = {
  maxWidth: '85%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const addressTextStyle = {
  ...ellipsisStyle,
  color: DEFAULT_POPUP_VALUE_COLOR,
  fontSize: 15,
}

const xsAddressTextStyle = {
  ...addressTextStyle,
  fontSize: 13
}

const networkTextStyle = {
  ...addressTextStyle,
  maxWidth: '55%',
}

const xsNetworkTextStyle = {
  ...xsAddressTextStyle,
  maxWidth: '55%'
}

const horizontalDividerStyle = {
  width: '100%',
  height: 1,
  backgroundColor: DEFAULT_STATS_TABLE_VERTICAL_DIVIDER_COLOR,
  position: 'absolute',
  top: '50%',
  left: 0,
}

const lowRowStyle = {
  width: '70%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
}

const iconStyle = {
  marginRight: 8
}

const verticalDividerStyle = {
  width: 1,
  height: 23,
  backgroundColor: DEFAULT_STATS_TABLE_VERTICAL_DIVIDER_COLOR,
}

const MyMeasurementInfoModalTable = ({
  address,
  networkType,
  networkLocation
}) => {

  const {isExtraSmallSizeScreen} = useViewportSizes();

  const getNetworkTypeIcon = () => {
    const type = types.find(placement => placement.text === networkType);
    return type.iconPopupSrc;
  }

  const getNetworkLocationIcon = () => {
    const location = placementOptions.find(placement => placement.text === networkLocation);
    return location.iconPopupSrc;
  }

  return (
    <div style={isExtraSmallSizeScreen ? xsTableStyle : tableStyle}>
      <div style={addressRowStyle}>
        <div style={locationIconContainerStyle}>
          <img src={LocationIcon} width={20} height={20} alt={'location-icon'}/>
        </div>
        <div className={'speedtest--bold'} style={isExtraSmallSizeScreen ? xsAddressTextStyle : addressTextStyle}>{address}</div>
      </div>
      {
        (networkLocation || networkType) &&
        <div style={horizontalDividerStyle}></div>
      }
      {
        (networkLocation || networkType) &&
          <div style={lowRowStyle}>
          {
            networkLocation &&
            <div className={'speedtest--bold'} style={addressRowStyle}>
              <img src={getNetworkLocationIcon()} width={isExtraSmallSizeScreen ? 20 : 28} height={isExtraSmallSizeScreen ? 20 : 28} alt={'location-icon'} style={iconStyle}/>
              <div style={isExtraSmallSizeScreen ? xsNetworkTextStyle : networkTextStyle}>{networkLocation}</div>
            </div>
          }
          {
            networkLocation && networkType &&
            <div style={verticalDividerStyle}></div>
          }
          {
            networkType &&
            <div className={'speedtest--bold'} style={addressRowStyle}>
              <img src={getNetworkTypeIcon()} width={isExtraSmallSizeScreen ? 20 : 28} height={isExtraSmallSizeScreen ? 20 : 28} alt={'location-icon'} style={iconStyle}/>
              <div style={isExtraSmallSizeScreen ? xsNetworkTextStyle : networkTextStyle}>{networkType}</div>
            </div>
          }
        </div>
      }
    </div>
  )
}

export default MyMeasurementInfoModalTable;