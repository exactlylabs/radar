import {
  DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  DEFAULT_SECONDARY_TEXT,
  DEFAULT_TEXT_COLOR,
  WHITE
} from "../../../utils/colors";

const fullContainerStyle = {
  width: '100vw',
  backgroundColor: WHITE,
}

const heroSectionStyle = {
  width: '100vw',
  padding: '142px 0',
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  position: 'relative'
}

const midHeroSectionStyle = {
  width: '100vw',
  padding: '70px 0',
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  position: 'relative'
}

const smallHeroSectionStyle = {
  width: '100vw',
  padding: '40px 0 0 0',
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  position: 'relative'
}

const heroSectionContentStyle = {
  width: '90%',
  maxWidth: '1200px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'relative',
  zIndex: 1,
}

const smallHeroSectionContentStyle = {
  width: 'calc(100% - 40px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'relative',
  zIndex: 1,
  textAlign: 'center'
}

const heroTextContainerStyle = {
  width: '40%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left'
}

const smallHeroTextContainerStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'center'
}

const heroButtonsContainer = {
  width: '85%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: 0,
  marginRight: 'auto',
  flexWrap: 'wrap',
  marginTop: '-30px',
}

const smallHeroButtonsContainer = {
  width: '100%',
  height: '107px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const arrowStyle = {
  width: '14px',
  height: '14px',
  marginRight: '-4px',
  marginLeft: '15px'
}

const heroTitleStyle = {
  fontSize: '36px',
  lineHeight: '48px',
  letterSpacing: '-0.9px',
  margin: '0 0 13px 0',
  color: DEFAULT_TEXT_COLOR
}

const smallHeroTitleStyle = {
  fontSize: '24px',
  lineHeight: '30px',
  margin: '0 0 10px 0',
  color: DEFAULT_TEXT_COLOR
}

const heroSubtitleStyle = {
  fontSize: '18px',
  lineHeight: '28px',
  margin: '0 0 30px 0',
  color: DEFAULT_TEXT_COLOR
}

const smallHeroSubtitleStyle = {
  fontSize: '16px',
  lineHeight: '25px',
  margin: '0 0 20px 0',
  color: DEFAULT_TEXT_COLOR
}

const heroMapStyle = {
  width: 'auto',
  height: '100%',
  position: 'absolute',
  bottom: 0,
  right: 0,
  zIndex: 0,
}

const largeHeroMapStyle = {
  width: 'auto',
  height: '100%',
  position: 'absolute',
  bottom: 0,
  left: '40vw',
  zIndex: 0,
}

const midHeroMapStyle = {
  width: 'auto',
  height: '100%',
  position: 'absolute',
  bottom: 0,
  left: '30vw',
  zIndex: 0,
}

const smallHeroMapStyle = {
  width: '540px',
  height: 'auto',
  position: 'absolute',
  bottom: 0,
  left: '50%',
  marginLeft: '-270px',
  zIndex: 0,
}

const heroSpeedStyle = {
  width: '40%',
  height: 'auto',
  position: 'absolute',
  bottom: '-3vw',
  right: '5vw',
  maxWidth: '478px',
}

const midHeroSpeedStyle = {
  height: '350px',
  width: 'auto',
  position: 'absolute',
  top: '25px',
  right: '0'
}

const smallHeroSpeedStyle = {
  width: '100%',
  height: 'auto',
  position: 'relative',
  maxWidth: '400px',
  margin: '40px auto 0',
  minWidth: '330px',
}

const dataSectionStyle = {
  width: '100vw',
  padding: '60px 0',
  backgroundColor: WHITE,
  position: 'relative'
}

const smallDataSectionStyle = {
  width: '100vw',
  padding: '40px 0',
  backgroundColor: WHITE,
  position: 'relative'
}

const dataSectionContentStyle = {
  width: '90%',
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const smallDataSectionContentStyle = {
  width: 'calc(100% - 40px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'center',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const dataSectionColumnsWrapperStyle = {
  width: '90%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const smallDataSectionColumnsWrapperStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginLeft: 'auto',
  marginRight: 'auto',
}

const dataTitle = {
  fontSize: '28px',
  lineHeight: '36px',
  letterSpacing: '-0.58px',
  width: '100%',
  maxWidth: '576px',
  margin: '0 0 50px 0',
  color: DEFAULT_TEXT_COLOR
}

const smallDataTitle = {
  fontSize: '20px',
  lineHeight: '28px',
  width: '100%',
  margin: '0 0 30px 0',
  color: DEFAULT_TEXT_COLOR
}

const mobileSectionStyle = {
  width: '100vw',
  padding: '124px 0',
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  position: 'relative'
}

const largeMobileSectionStyle = {
  ...mobileSectionStyle,
  padding: '75px 0',
}

const smallMobileSectionStyle = {
  width: '100vw',
  padding: '40px 0',
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  position: 'relative'
}

const mobileSectionContentStyle = {
  width: 'calc(90% - 140px)',
  maxWidth: '1200px',
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'relative',
}

const smallMobileSectionContentStyle = {
  width: 'calc(100% - 40px)',
  marginLeft: 'auto',
  marginRight: 'auto',
  position: 'relative',
  textAlign: 'center'
}

const mobileImageStyle = {
  position: 'absolute',
  left: 0,
  top: '-15%',
  width: '46%',
  height: 'auto'
}

const largeMobileImageStyle = {
  position: 'absolute',
  left: '-10%',
  top: 0,
  width: '55%',
  height: 'auto'
}

const smallMobileImageStyle = {
  width: '100%',
  height: 'auto',
  margin: '0 auto 10px',
  maxWidth: '450px',
}

const mobileTextContainerStyle = {
  width: '40%',
  marginRight: 0,
  marginLeft: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
}

const largeTextContainerStyle = {
  ...mobileTextContainerStyle,
  width: '50%',
}

const smallMobileTextContainerStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'center',
}

const mobileIntroTextStyle = {
  fontSize: '18px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0 0 15px 0'
}

const smallMobileIntroTextStyle = {
  ...mobileIntroTextStyle,
  margin: '0 0 10px 0',
  width: '100%',
}

const mobileTitleStyle = {
  fontSize: '34px',
  lineHeight: '42px',
  letterSpacing: '-0.7px',
  margin: '0 0 25px 0',
  color: DEFAULT_TEXT_COLOR
}

const smallMobileTitleStyle = {
  fontSize: '20px',
  lineHeight: '28px',
  margin: '0 0 10px 0',
  width: '100%',
  color: DEFAULT_TEXT_COLOR
}

const mobileTextStyle = {
  fontSize: '17px',
  lineHeight: '28px',
  margin: '0 0 30px 0',
  color: DEFAULT_TEXT_COLOR
}

const smallMobileTextStyle = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 30px 0',
  width: '100%',
  color: DEFAULT_TEXT_COLOR
}

const storesContainer = {
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const smallStoresContainer = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
}

const appStoreStyle = {
  width: '144px',
  height: 'auto',
  marginRight: '25px',
}

const smallAppStoreStyle = {
  ...appStoreStyle,
  marginRight: 0,
  marginBottom: '15px',
}

const googlePlayStyle = {
  width: '162px',
  height: 'auto',
}

const smallGooglePlayStyle = {
  ...googlePlayStyle,
  marginBottom: '20px'
}

export const overviewStyles = {
  fullContainerStyle,
  heroSectionStyle,
  smallHeroSectionStyle,
  midHeroSectionStyle,
  heroSectionContentStyle,
  smallHeroSectionContentStyle,
  heroTextContainerStyle,
  smallHeroTextContainerStyle,
  heroButtonsContainer,
  smallHeroButtonsContainer,
  arrowStyle,
  heroTitleStyle,
  smallHeroTitleStyle,
  heroSubtitleStyle,
  smallHeroSubtitleStyle,
  heroMapStyle,
  smallHeroMapStyle,
  midHeroMapStyle,
  largeHeroMapStyle,
  heroSpeedStyle,
  smallHeroSpeedStyle,
  midHeroSpeedStyle,
  dataSectionStyle,
  smallDataSectionStyle,
  dataSectionContentStyle,
  smallDataSectionContentStyle,
  dataSectionColumnsWrapperStyle,
  smallDataSectionColumnsWrapperStyle,
  dataTitle,
  smallDataTitle,
  mobileSectionStyle,
  largeMobileSectionStyle,
  smallMobileSectionStyle,
  mobileSectionContentStyle,
  smallMobileSectionContentStyle,
  mobileImageStyle,
  largeMobileImageStyle,
  smallMobileImageStyle,
  mobileTextContainerStyle,
  largeTextContainerStyle,
  smallMobileTextContainerStyle,
  mobileIntroTextStyle,
  smallMobileIntroTextStyle,
  mobileTitleStyle,
  smallMobileTitleStyle,
  mobileTextStyle,
  smallMobileTextStyle,
  storesContainer,
  smallStoresContainer,
  appStoreStyle,
  smallAppStoreStyle,
  googlePlayStyle,
  smallGooglePlayStyle
}