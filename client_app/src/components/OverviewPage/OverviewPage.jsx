import Frame from "../Frame/Frame";
import {baseInitConfig} from "../../index";
import {MyButton} from "../common/MyButton";
import {CustomSecondaryButton} from "../common/CustomSecondaryButton";
import {useHistory} from "react-router-dom";
import {overviewStyles} from './styles/OverviewPage.style';
import DataColumn from "./DataColumn";
import {useViewportSizes} from "../../hooks/useViewportSizes";

import arrowRightWhite from '../../assets/right-arrow-white.png';
import arrowRightBlue from '../../assets/right-arrow-blue.png';
import overviewHeroMap from '../../assets/overview-hero-map.png';
import overviewHeroSpeed from '../../assets/overview-hero-speed.png';
import communitiesIcon from '../../assets/communities-icon.png';
import speedtestsIcon from '../../assets/speedtests-icon.png';
import mapIcon from '../../assets/map-icon.png';
import mobilePhones from '../../assets/mobile-image.png';
import appStore from '../../assets/appstore.png';
import googlePlay from '../../assets/googleplay.png';

const OverviewPage = () => {

  const {isSmallSizeScreen, isMediumSizeScreen, isLargeSizeScreen, isXLSizeScreen} = useViewportSizes();
  const isSmall = isSmallSizeScreen || isMediumSizeScreen;
  const history = useHistory();

  const goToExplore = () => {
    window.location.href = '/?tab=2';
  }

  const goToTest = () => {
    history.push('/');
  }

  return (
    <Frame isOverviewPage config={baseInitConfig}>
      <div style={isSmall ? overviewStyles.smallHeroSectionStyle :
                  isLargeSizeScreen ? overviewStyles.midHeroSectionStyle :
                  overviewStyles.heroSectionStyle}
      >
        <div style={isSmall ? overviewStyles.smallHeroSectionContentStyle : overviewStyles.heroSectionContentStyle}>
          <div style={isSmall ? overviewStyles.smallHeroTextContainerStyle : overviewStyles.heroTextContainerStyle}>
            <p className={'extra-bold'} style={isSmall ? overviewStyles.smallHeroTitleStyle : overviewStyles.heroTitleStyle}>Test and compare your internet speed to others in your area.</p>
            <p style={isSmall ? overviewStyles.smallHeroSubtitleStyle : overviewStyles.heroSubtitleStyle}>Radar lets you run speed tests on your computer or mobile phone and compare your results to others in your community or in the country.</p>
            <div style={isSmall ? overviewStyles.smallHeroButtonsContainer : overviewStyles.heroButtonsContainer}>
              <div style={{width: 'max-content', marginTop: '15px'}}>
                <MyButton text={'Test your speed'} icon={<img src={arrowRightWhite} style={overviewStyles.arrowStyle} alt={'arrow right blue'}/>} onClick={goToTest}/>
              </div>
              <div style={{width: 'max-content', marginTop: '15px'}}>
                <CustomSecondaryButton text={'Explore the map'} icon={<img src={arrowRightBlue} style={overviewStyles.arrowStyle} alt={'arrow right white'}/>} onClick={goToExplore}/>
              </div>
            </div>
          </div>
          <img src={overviewHeroSpeed}
               alt={'overview hero speed'}
               style={isSmall ? overviewStyles.smallHeroSpeedStyle :
                      isLargeSizeScreen ? overviewStyles.midHeroSpeedStyle :
                      overviewStyles.heroSpeedStyle}
          />
        </div>
        <img src={overviewHeroMap}
             alt={'overview hero map'}
             style={isSmall ? overviewStyles.smallHeroMapStyle :
                    isLargeSizeScreen ? overviewStyles.midHeroMapStyle :
                    isXLSizeScreen ? overviewStyles.largeHeroMapStyle :
                    overviewStyles.heroMapStyle}
        />
      </div>
      <div style={isSmall ? overviewStyles.smallDataSectionStyle : overviewStyles.dataSectionStyle}>
        <div style={isSmall ? overviewStyles.smallDataSectionContentStyle : overviewStyles.dataSectionContentStyle}>
          <p className={'extra-bold'} style={isSmall ? overviewStyles.smallDataTitle : overviewStyles.dataTitle}>We collect thousands of speed test results to understand how broadband varies across the country.</p>
          <div style={isSmall ? overviewStyles.smallDataSectionColumnsWrapperStyle : overviewStyles.dataSectionColumnsWrapperStyle}>
            <DataColumn iconSrc={communitiesIcon}
                        title={'Explore real data'}
                        text={'We use real data from speed tests to provide insight into broadband performance nationwide.'}
                        isStacked={isSmall}
            />
            <DataColumn iconSrc={speedtestsIcon}
                        title={'See results on the map'}
                        text={'Explore your area on the map and see how broadband varies across different regions.'}
                        isStacked={isSmall}
            />
            <DataColumn iconSrc={mapIcon}
                        title={'Identify broadband needs'}
                        text={'Our data-driven approach helps communities pinpoint where broadband is most needed.'}
                        isStacked={isSmall}
                        isLast
            />
          </div>
        </div>
      </div>
      <div style={isSmall ? overviewStyles.smallMobileSectionStyle :
                  isLargeSizeScreen || isXLSizeScreen ? overviewStyles.largeMobileSectionStyle :
                  overviewStyles.mobileSectionStyle}
      >
        <div style={isSmall ? overviewStyles.smallMobileSectionContentStyle : overviewStyles.mobileSectionContentStyle}>
          { !isSmall && <img src={mobilePhones} style={isLargeSizeScreen ? overviewStyles.largeMobileImageStyle : overviewStyles.mobileImageStyle} alt={'phones image'}/> }
          <div style={isSmall ? overviewStyles.smallMobileTextContainerStyle :
                      isLargeSizeScreen ? overviewStyles.largeTextContainerStyle:
                      overviewStyles.mobileTextContainerStyle}
          >
            <p className={'bold'} style={isSmall ? overviewStyles.smallMobileIntroTextStyle : overviewStyles.mobileIntroTextStyle}>Radar for Mobile</p>
            <p className={'extra-bold'} style={isSmall ? overviewStyles.smallMobileTitleStyle : overviewStyles.mobileTitleStyle}>Test your wifi and cellular connections with our mobile app.</p>
            <p style={isSmall ? overviewStyles.smallMobileTextStyle : overviewStyles.mobileTextStyle}>Radar lets you run speed tests outdoors and indoors, compare results over time, and compare your results with your neighborhood to get a better idea of how broadband looks like around you.</p>
            <div style={isSmall ? overviewStyles.smallStoresContainer : overviewStyles.storesContainer}>
              <img src={appStore} style={isSmall ? overviewStyles.smallAppStoreStyle : overviewStyles.appStoreStyle} alt={'app Store icon'}/>
              <img src={googlePlay} style={isSmall ? overviewStyles.smallGooglePlayStyle : overviewStyles.googlePlayStyle} alt={'Google Play icon'}/>
            </div>
          </div>
          { isSmall && <img src={mobilePhones} style={overviewStyles.smallMobileImageStyle} alt={'phones image'}/> }
        </div>
      </div>
    </Frame>
  )
}

export default OverviewPage;