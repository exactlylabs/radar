import {
  DEFAULT_CONNECTION_INFORMATION_BACKGROUND_COLOR,
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
import MyConnectionInformationTooltip from "./MyConnectionInformationTooltip";

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

const withoutTextPlacementRowStyle = {
  ...commonRowStyle,
  width: 'max-content',
  minWidth: 30,
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

  const {isExtraSmallSizeScreen, isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const [shouldTextAppear, setShouldTextAppear] = useState(window.innerWidth > CONNECTION_INFORMATION_MIN_WIDTH && !isExtraSmallSizeScreen);

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
    return isMediumSizeScreen || isSmallSizeScreen ? 'N/A' : 'Not available';
  }

  const getAddressStyle = () => {
    let style = (isMediumSizeScreen || isSmallSizeScreen) ? mobileAddressRowStyle : addressRowStyle;
    return shouldTextAppear ? style : {...style, maxWidth: 175};
  }

  const getPlacementOrTypeCellStyle = () => shouldTextAppear ?  placementRowStyle : withoutTextPlacementRowStyle;

  const getTitle = () => {
    const {house_number, street} = userStepData.address;
    if((!house_number && !street) || (house_number && !street)) return 'Unavailable'; // makes no sense to just show the house number on its own
    if(!house_number) return street;
    return `${userStepData.address.house_number} ${userStepData.address.street}`;
  }

  const getSubtitle = () => {
    const {city, state, postal_code} = userStepData.address;
    if(!city && !state && !postal_code) return 'Unavailable';
    let parsedCity = city ?? '';
    let parsedState = state ?? '';
    let parsedPostalCode = postal_code ?? '';
    if(!!parsedCity && (!!parsedState || !!parsedPostalCode)) parsedCity += ','; // add comma only if there is going to be another field to separate from with it
    return `${parsedCity} ${parsedState} ${parsedPostalCode}`;
  }

  return (
    <div style={getStyle()}>
      <div style={columnsContainerStyle}>
        <MyConnectionInformationTooltip title={getTitle()}
                                        subtitle={getSubtitle()}
                                        shouldNotAppear={disabled}
        >
          <div className={'speedtest--bold'} style={getAddressStyle()}>
            <img style={iconStyle} src={AddressIcon} width={22} height={22} alt={'address-icon'}/>
            <div style={addressStyle}>{userStepData.address.address}</div>
          </div>
        </MyConnectionInformationTooltip>
        <MyConnectionInformationVerticalDivider disabled={disabled}/>
        {
          !!userStepData.networkLocation &&
          <MyConnectionInformationTooltip subtitle={'You are connected at '}
                                          accent={`${userStepData.networkLocation.text}.`}
                                          shouldNotAppear={disabled}
          >
            <div className={'speedtest--bold'} style={getPlacementOrTypeCellStyle()}>
              <img style={iconStyle}
                   src={userStepData.networkLocation ? userStepData.networkLocation.iconLightSrc : HomeIconLight}
                   width={22} height={22} alt={'address-icon'}/>
              {shouldTextAppear && <div style={addressStyle}>{getText(userStepData.networkLocation)}</div>}
            </div>
          </MyConnectionInformationTooltip>
        }
        {
          !!userStepData.networkType &&
          <>
            <MyConnectionInformationVerticalDivider disabled={disabled}/>
            <MyConnectionInformationTooltip subtitle={'You are connected via '}
                                            accent={`${userStepData.networkType.text}.`}
                                            shouldNotAppear={disabled}
            >
              <div className={'speedtest--bold'} style={getPlacementOrTypeCellStyle()}>
                <img style={iconStyle} src={userStepData.networkType ? userStepData.networkType.iconLightSrc : WifiIconLight} width={22} height={22} alt={'address-icon'}/>
                { shouldTextAppear && <div style={addressStyle}>{getText(userStepData.networkType)}</div> }
              </div>
            </MyConnectionInformationTooltip>
          </>
        }
      </div>
      <div style={{...progressBarStyle, width: `${progress}%`}}></div>
    </div>
  );
}

export default ConnectionInformation;