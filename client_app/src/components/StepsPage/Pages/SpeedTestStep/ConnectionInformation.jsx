import {
  DEFAULT_CONNECTION_INFORMATION_BACKGROUND_COLOR, DEFAULT_CONNECTION_INFORMATION_BOX_SHADOW,
  DEFAULT_CONNECTION_INFORMATION_BOX_SHADOW,
  DEFAULT_SPEED_TEST_PROGRESS_BAR_COLOR,
  WHITE
} from "../../../../utils/colors";
import MyConnectionInformationVerticalDivider from "./MyConnectionInformationVerticalDivider";
import AddressIcon from '../../../../assets/address-icon.png';
import HomeIconLight from '../../../../assets/icon-location-home-light.png';
import WifiIconLight from '../../../../assets/icon-connection-wifi-light.png';
import {useEffect, useState} from "react";
import {CONNECTION_INFORMATION_MIN_WIDTH} from "../../../../utils/breakpoints";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

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

const mobileStyle = {
  width: '100%',
  height: 43,
  backgroundColor: DEFAULT_CONNECTION_INFORMATION_BACKGROUND_COLOR,
  borderRadius: 16,
  margin: '25px auto 30px',
  position: 'relative',
  overflow: 'hidden'
}

const integratedStyle = {
  ...connectionInformationStyle,
  borderRadius: '16px 16px 0 0',
}

const integratedMobileStyle = {
  ...mobileStyle,
  borderRadius: '16px 16px 0 0',
  margin: 'auto',
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
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const addressRowStyle = {
  ...commonRowStyle,
}

const mobileAddressRowStyle = {
  ...commonRowStyle,
}

const placementRowStyle = {
  ...commonRowStyle,
  width: 'max-content',
  minWidth: 75,
}

const typeRowStyle = {
  ...commonRowStyle,
  width: 'max-content',
  minWidth: 75,
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
  whiteSpace:'nowrap',
  fontSize: 15,
}

const ConnectionInformation = ({
  disabled,
  progress = 0,
  userStepData,
  integratedToStatsTable
}) => {

  const [shouldTextAppear, setShouldTextAppear] = useState(window.innerWidth > CONNECTION_INFORMATION_MIN_WIDTH);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  useEffect(() => {
    window.addEventListener('resize', () => setShouldTextAppear(window.innerWidth > CONNECTION_INFORMATION_MIN_WIDTH));
    return () => window.removeEventListener('resize', () => setShouldTextAppear(window.innerWidth > CONNECTION_INFORMATION_MIN_WIDTH));
  }, []);

  const getStyle = () => {
    let style;
    if((isMediumSizeScreen || isSmallSizeScreen) && !integratedToStatsTable) style = mobileStyle;
    else if((isMediumSizeScreen || isSmallSizeScreen) && integratedToStatsTable) style = integratedMobileStyle;
    else if(!(isMediumSizeScreen || isSmallSizeScreen) && integratedToStatsTable) style = integratedStyle;
    else style = connectionInformationStyle;
    if(!integratedToStatsTable) style = {...style, boxShadow: DEFAULT_CONNECTION_INFORMATION_BOX_SHADOW}
    return disabled ? {...style, opacity: 0.3} : style;
  }

  const getText = possibleData => {
    if(possibleData) return possibleData.text;
    return isMediumSizeScreen ? 'N/A' : 'Not available';
  }

  const getAddressStyle = () => {
    let style = (isMediumSizeScreen || isSmallSizeScreen) ? mobileAddressRowStyle : addressRowStyle;
    return shouldTextAppear ? style : {...style, maxWidth: 175};
  }

  return (
    <div style={getStyle()}>
      <div style={columnsContainerStyle}>
        <div className={'bold'} style={getAddressStyle()}>
          <img style={iconStyle} src={AddressIcon} width={22} height={22} alt={'address-icon'}/>
          <div style={addressStyle}>{userStepData.address.address}</div>
        </div>
        <MyConnectionInformationVerticalDivider disabled={disabled}/>
        <div className={'bold'} style={placementRowStyle}>
          <img style={iconStyle} src={userStepData.networkLocation ? userStepData.networkLocation.iconLightSrc : HomeIconLight} width={22} height={22} alt={'address-icon'}/>
          { shouldTextAppear && <div style={addressStyle}>{getText(userStepData.networkLocation)}</div> }
        </div>
        <MyConnectionInformationVerticalDivider disabled={disabled}/>
        <div className={'bold'} style={typeRowStyle}>
          <img style={iconStyle} src={userStepData.networkType ? userStepData.networkType.iconLightSrc : WifiIconLight} width={22} height={22} alt={'address-icon'}/>
          { shouldTextAppear && <div style={addressStyle}>{getText(userStepData.networkType)}</div> }
        </div>
      </div>
      <div style={{...progressBarStyle, width: `${progress}%`}}></div>
    </div>
  );
}

export default ConnectionInformation;