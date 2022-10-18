import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Tabs from './Tabs';
import {DEFAULT_MAIN_SECTION_BACKGROUND_COLOR, WHITE} from '../../utils/colors';
import {STEPS} from "../../constants";
import WidgetFooter from "./WidgetFooter";
import {useViewportSizes} from "../../hooks/useViewportSizes";

const defaultMainWrapperStyle = {
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  overflowX: 'auto',
};

const widgetMainWrapperStyle = {
  backgroundColor: WHITE,
  overflowX: 'auto',
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

const Frame = ({ config, children, step, setStep }) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const getFrameStyleBasedOnCurrentTab = () => {
    if(step === STEPS.ALL_RESULTS) {
      if(config.widgetMode) return {...widgetFullWidthWrapperStyle, height: `${config.frameStyle.height} - 175px`};
      return isMediumSizeScreen || isSmallSizeScreen ? mobileFullWidthWrapperStyle : fullWidthWrapperStyle;
    } else {
      return childrenWrapperStyle;
    }
  }

  const getWrapperStyle = () => {
    let baseStyle;
    if(config.widgetMode) baseStyle = widgetMainWrapperStyle;
    else baseStyle = defaultMainWrapperStyle;
    return {...baseStyle, ...config.frameStyle};
  }

  const getMinHeight = () => {
    if(config.widgetMode) {
      return `calc(${config.frameStyle.height} - 175px)`;
    } else {
      return `calc(${config.frameStyle.height} - 70px - 173px - 53px)`;
    }
  }

  return (
    <div style={getWrapperStyle()} id={'main-frame'}>
      {!config.widgetMode && <Header setStep={setStep}/>}
      <Tabs step={step} setStep={setStep}/>
      <div style={{ ...getFrameStyleBasedOnCurrentTab(), minHeight: getMinHeight() }} id={'frame--main-frame-wrapper'}>
        {children}
      </div>
      {!config.widgetMode && <Footer />}
      {config.widgetMode && <WidgetFooter />}
    </div>
  );
};

export default Frame;
