import Frame from "../Frame/Frame";
import {baseInitConfig} from "../../index";
import {MyButton} from "../common/MyButton";
import {CustomSecondaryButton} from "../common/CustomSecondaryButton";
import {useHistory} from "react-router-dom";
import {overviewStyles} from './styles/OverviewPage.style';
import DataColumn from "./DataColumn";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import { useTranslation } from 'react-i18next';

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

const OverviewPage = ({goToExplore, goToTest}) => {
  const { t } = useTranslation();
  const {isSmallSizeScreen, isMediumSizeScreen, isLargeSizeScreen, isXLSizeScreen} = useViewportSizes();
  const isSmall = isSmallSizeScreen || isMediumSizeScreen;

  return (
    <div style={overviewStyles.fullContainerStyle}>
      <div style={isSmall ? overviewStyles.smallHeroSectionStyle :
                  isLargeSizeScreen ? overviewStyles.midHeroSectionStyle :
                  overviewStyles.heroSectionStyle}
      >
        <div style={isSmall ? overviewStyles.smallHeroSectionContentStyle : overviewStyles.heroSectionContentStyle}>
          <div style={isSmall ? overviewStyles.smallHeroTextContainerStyle : overviewStyles.heroTextContainerStyle}>
            <p className={'speedtest--p speedtest--extra-bold'} style={isSmall ? overviewStyles.smallHeroTitleStyle : overviewStyles.heroTitleStyle}>{t('overview.hero.title')}</p>
            <p className={'speedtest--p'} style={isSmall ? overviewStyles.smallHeroSubtitleStyle : overviewStyles.heroSubtitleStyle}>{t('overview.hero.subtitle')}</p>
            <div style={isSmall ? overviewStyles.smallHeroButtonsContainer : overviewStyles.heroButtonsContainer}>
              <div style={{width: 'max-content', marginTop: '15px'}}>
                <MyButton text={t('overview.hero.buttons.test')} icon={<img src={arrowRightWhite} style={overviewStyles.arrowStyle} alt={t('alt.icons.arrowRightBlue')}/>} onClick={goToTest}/>
              </div>
              <div style={{width: 'max-content', marginTop: '15px'}}>
                <CustomSecondaryButton text={t('overview.hero.buttons.explore')} icon={<img src={arrowRightBlue} style={overviewStyles.arrowStyle} alt={t('alt.icons.arrowRightWhite')}/>} onClick={() => goToExplore()}/>
              </div>
            </div>
          </div>
          <img src={overviewHeroSpeed}
               alt={t('alt.icons.overviewHeroSpeed')}
               style={isSmall ? overviewStyles.smallHeroSpeedStyle :
                      isLargeSizeScreen ? overviewStyles.midHeroSpeedStyle :
                      overviewStyles.heroSpeedStyle}
          />
        </div>
        <img src={overviewHeroMap}
             alt={t('alt.icons.overviewHeroMap')}
             style={isSmall ? overviewStyles.smallHeroMapStyle :
                    isLargeSizeScreen ? overviewStyles.midHeroMapStyle :
                    isXLSizeScreen ? overviewStyles.largeHeroMapStyle :
                    overviewStyles.heroMapStyle}
        />
      </div>
      <div style={isSmall ? overviewStyles.smallDataSectionStyle : overviewStyles.dataSectionStyle}>
        <div style={isSmall ? overviewStyles.smallDataSectionContentStyle : overviewStyles.dataSectionContentStyle}>
          <p className={'speedtest--p speedtest--extra-bold'} style={isSmall ? overviewStyles.smallDataTitle : overviewStyles.dataTitle}>{t('overview.data.title')}</p>
          <div style={isSmall ? overviewStyles.smallDataSectionColumnsWrapperStyle : overviewStyles.dataSectionColumnsWrapperStyle}>
            <DataColumn iconSrc={communitiesIcon}
                        title={t('overview.data.features.explore.title')}
                        text={t('overview.data.features.explore.description')}
                        isStacked={isSmall}
            />
            <DataColumn iconSrc={speedtestsIcon}
                        title={t('overview.data.features.map.title')}
                        text={t('overview.data.features.map.description')}
                        isStacked={isSmall}
            />
            <DataColumn iconSrc={mapIcon}
                        title={t('overview.data.features.identify.title')}
                        text={t('overview.data.features.identify.description')}
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
          { !isSmall && <img src={mobilePhones} style={isLargeSizeScreen ? overviewStyles.largeMobileImageStyle : overviewStyles.mobileImageStyle} alt={t('alt.icons.phonesImage')}/> }
          <div style={isSmall ? overviewStyles.smallMobileTextContainerStyle :
                      isLargeSizeScreen ? overviewStyles.largeTextContainerStyle:
                      overviewStyles.mobileTextContainerStyle}
          >
            <p className={'speedtest--p speedtest--bold'} style={isSmall ? overviewStyles.smallMobileIntroTextStyle : overviewStyles.mobileIntroTextStyle}>{t('overview.mobile.intro')}</p>
            <p className={'speedtest--p speedtest--extra-bold'} style={isSmall ? overviewStyles.smallMobileTitleStyle : overviewStyles.mobileTitleStyle}>{t('overview.mobile.title')}</p>
            <p className={'speedtest--p'} style={isSmall ? overviewStyles.smallMobileTextStyle : overviewStyles.mobileTextStyle}>{t('overview.mobile.description')}</p>
            <div style={isSmall ? overviewStyles.smallStoresContainer : overviewStyles.storesContainer}>
              <img src={appStore} style={isSmall ? overviewStyles.smallAppStoreStyle : overviewStyles.appStoreStyle} alt={t('alt.icons.appStore')}/>
              <img src={googlePlay} style={isSmall ? overviewStyles.smallGooglePlayStyle : overviewStyles.googlePlayStyle} alt={t('alt.icons.googlePlay')}/>
            </div>
          </div>
          { isSmall && <img src={mobilePhones} style={overviewStyles.smallMobileImageStyle} alt={t('alt.icons.phonesImage')}/> }
        </div>
      </div>
    </div>
  )
}

export default OverviewPage;