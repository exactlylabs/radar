import {
  DEFAULT_CONNECTION_INFORMATION_BACKGROUND_COLOR,
  DEFAULT_SPEED_TEST_PROGRESS_BAR_COLOR,
  WHITE
} from "../../../../utils/colors";
import MyConnectionInformationVerticalDivider from "./MyConnectionInformationVerticalDivider";
import AddressIcon from '../../../../assets/address-icon.png';

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
  maxWidth: 300,
}

const placementRowStyle = {
  ...commonRowStyle,
}

const typeRowStyle = {
  ...commonRowStyle,
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
  userStepData
}) => {

  const calculateAvailableWidth = () => {
    const hasNetworkLocation = userStepData.networkLocation !== null;
    const hasNetworkType = userStepData.networkType !== null;
    let width = 300;
    if((!hasNetworkLocation && hasNetworkType) || (hasNetworkLocation && !hasNetworkType)) width = 400;
    if(!hasNetworkLocation && !hasNetworkType) width = '95%';
    return width;
  }

  return (
    <div style={disabled ? opaqueStyle : connectionInformationStyle}>
      <div style={columnsContainerStyle}>
        <div style={{...addressRowStyle, maxWidth: calculateAvailableWidth()}}>
          <img style={iconStyle} src={AddressIcon} width={22} height={22} alt={'address-icon'}/>
          <div style={addressStyle}>{userStepData.address}</div>
        </div>
        {
          userStepData.networkLocation &&
          <>
            <MyConnectionInformationVerticalDivider disabled={disabled}/>
            <div style={placementRowStyle}>
              <img style={iconStyle} src={userStepData.networkLocation.iconLightSrc} width={22} height={22} alt={'address-icon'}/>
              {userStepData.networkLocation.text}
            </div>
          </>
        }
        {
          userStepData.networkType &&
          <>
            <MyConnectionInformationVerticalDivider disabled={disabled}/>
            <div style={typeRowStyle}>
              <img style={iconStyle} src={userStepData.networkType.iconLightSrc} width={22} height={22} alt={'address-icon'}/>
              {userStepData.networkType.text}
            </div>
          </>
        }
      </div>
      <div style={{...progressBarStyle, width: `${progress}%`}}></div>
    </div>
  );
}

export default ConnectionInformation;