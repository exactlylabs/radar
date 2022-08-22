import {
  DEFAULT_CONNECTION_INFORMATION_BACKGROUND_COLOR,
  DEFAULT_SPEED_TEST_PROGRESS_BAR_COLOR,
  WHITE
} from "../../../../utils/colors";
import MyConnectionInformationVerticalDivider from "./MyConnectionInformationVerticalDivider";
import AddressIcon from '../../../../assets/address-icon.png';
import HomeIconLight from '../../../../assets/icon-location-home-light.png';
import WifiIconLight from '../../../../assets/icon-connection-wifi-light.png';

const connectionInformationStyle = {
  width: '100%',
  minWidth: 550,
  maxWidth: 600,
  height: 43,
  backgroundColor: DEFAULT_CONNECTION_INFORMATION_BACKGROUND_COLOR,
  borderRadius: 16,
  margin: '0 auto',
  position: 'relative',
  overflow: 'hidden'
}

const integratedStyle = {
  ...connectionInformationStyle,
  borderRadius: '16px 16px 0 0',
}

const opaqueStyle = {
  ...connectionInformationStyle,
  opacity: 0.3,
}

const columnsContainerStyle = {
  width: '95%',
  height: 'calc(100% - 3px)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  margin: 'auto',
}

const commonRowStyle = {
  color: WHITE,
  fontSize: 15,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}

const addressRowStyle = {
  ...commonRowStyle,
  maxWidth: 200,
}

const placementRowStyle = {
  ...commonRowStyle,
  width: 'max-content',
}

const typeRowStyle = {
  ...commonRowStyle,
  width: 'max-content',
}

const iconStyle = {
  marginRight: 8,
}

const progressBarStyle = {
  width: 0,
  height: 3,
  backgroundColor: DEFAULT_SPEED_TEST_PROGRESS_BAR_COLOR,
  position: 'absolute',
  bottom: 0
}

const addressStyle = {
  color: WHITE,
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace:'nowrap'
}

const ConnectionInformation = ({
  disabled,
  progress = 0,
  userStepData,
  integratedToStatsTable
}) => {

  const getStyle = () => {
    if(integratedToStatsTable) return integratedStyle;
    return disabled ? opaqueStyle : connectionInformationStyle;
  }

  return (
    <div style={getStyle()}>
      <div style={columnsContainerStyle}>
        <div style={addressRowStyle}>
          <img style={iconStyle} src={AddressIcon} width={22} height={22} alt={'address-icon'}/>
          <div style={addressStyle}>{userStepData.address.address}</div>
        </div>
        <MyConnectionInformationVerticalDivider disabled={disabled}/>
        <div style={placementRowStyle}>
          <img style={iconStyle} src={userStepData.networkLocation ? userStepData.networkLocation.iconLightSrc : HomeIconLight} width={22} height={22} alt={'address-icon'}/>
          {userStepData.networkLocation ? userStepData.networkLocation.text : 'Not available'}
        </div>
        <MyConnectionInformationVerticalDivider disabled={disabled}/>
        <div style={typeRowStyle}>
          <img style={iconStyle} src={userStepData.networkType ? userStepData.networkType.iconLightSrc : WifiIconLight} width={22} height={22} alt={'address-icon'}/>
          {userStepData.networkType ? userStepData.networkType.text : 'Not available'}
        </div>
      </div>
      <div style={{...progressBarStyle, width: `${progress}%`}}></div>
    </div>
  );
}

export default ConnectionInformation;