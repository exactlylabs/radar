import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Tabs from './Tabs';
import {DEFAULT_MAIN_SECTION_BACKGROUND_COLOR, WHITE} from '../../utils/colors';
import {TABS} from "../../constants";
import WidgetFooter from "./WidgetFooter";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const defaultMainWrapperStyle = {
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  overflowX: 'auto',
};

const defaultOverviewWrapperStyle = {
  backgroundColor: WHITE,
  overflowX: 'auto',
}

const defaultAllResultsWrapperStyle = {
  overflow: 'hidden',
}

const widgetMainWrapperStyle = {
  backgroundColor: WHITE,
  overflowX: 'auto',
  overflowY: 'auto',
}

const webviewMainWrapperStyle = {
  backgroundColor: WHITE,
  overflowX: 'auto',
  overflowY: 'hidden',
}

const childrenWrapperStyle = {
  width: '90%',
  margin: '0 auto',
  overflowY: 'auto',
  height: 'auto',
};

const fullWidthWrapperStyle = {
  ...childrenWrapperStyle,
  width: '100%',
  overflowX: 'hidden',
}

const mobileFullWidthWrapperStyle = {
  ...fullWidthWrapperStyle,
  height: 'calc(100vh - 125px)',
}

const widgetFullWidthWrapperStyle = {
  ...fullWidthWrapperStyle,
}

const overviewPageStyle = {
  width: '100vw',
  height: 'auto',
}

const Frame = ({ config, children, step, setStep }) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const shouldShowTabs = !config.webviewMode && !isOverviewPage;
  const isOverviewPage = step === TABS.OVERVIEW;
  const isAllResultsPage = step === TABS.ALL_RESULTS;

  const getFrameStyleBasedOnCurrentTab = () => {
    console.log(step === TABS.ALL_RESULTS, config.widgetMode, isAllResultsPage ? 'hidden' : 'auto')
    if(isOverviewPage) return overviewPageStyle;
    if(step === TABS.ALL_RESULTS) {
      if(config.widgetMode) return {...widgetFullWidthWrapperStyle, height: `${config.frameStyle.height} - 175px`, overflowY: isAllResultsPage ? 'hidden' : 'auto'};
      else if(config.webviewMode) return {...widgetFullWidthWrapperStyle, height: `${config.frameStyle.height}`};
      return isMediumSizeScreen || isSmallSizeScreen ? mobileFullWidthWrapperStyle : fullWidthWrapperStyle;
    } else {
      if(config.widgetMode) return {...childrenWrapperStyle, height: `${config.frameStyle.height} - 110px`, overflowY: 'auto'};
      return childrenWrapperStyle;
    }
  }

  const getWrapperStyle = () => {
    let baseStyle;
    if(config.webviewMode) baseStyle = webviewMainWrapperStyle;
    else if(config.widgetMode) baseStyle = widgetMainWrapperStyle
    else if(isOverviewPage) baseStyle = defaultOverviewWrapperStyle;
    else baseStyle = defaultMainWrapperStyle;
    return {...baseStyle, ...config.frameStyle};
  }

  const getMinHeight = () => {
    if(isOverviewPage) return undefined;
    if(config.widgetMode) {
      return `calc(${config.frameStyle.height} - 110px)`;
    } else if(config.webviewMode) {
      return `${config.frameStyle.height}`;
    } else {
      return `calc(${config.frameStyle.height} - 70px - 173px - 53px)`;
    }
  }

  return (
    <div style={getWrapperStyle()} id={'main-frame'}>
      {!config.widgetMode && !config.webviewMode && <Header setStep={setStep} isOverviewPage={isOverviewPage}/>}
      {shouldShowTabs && <Tabs step={step} setStep={setStep}/> }
      <div style={{ ...getFrameStyleBasedOnCurrentTab(), minHeight: getMinHeight() }} id={'frame--main-frame-wrapper'}>
        {children}
      </div>
      {!config.widgetMode && !config.webviewMode && <Footer />}
      {config.widgetMode && !config.webviewMode && <WidgetFooter />}
    </div>
  );
};

export default Frame;
