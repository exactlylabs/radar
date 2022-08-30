import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Tabs from './Tabs';
import { DEFAULT_MAIN_SECTION_BACKGROUND_COLOR } from '../../utils/colors';
import {STEPS} from "../../constants";
import {useScreenSize} from "../../hooks/useScreenSize";

const defaultMainWrapperStyle = {
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
  overflowX: 'auto',
};

const childrenWrapperStyle = {
  width: '90%',
  margin: '0 auto',
  overflowY: 'auto',
  height: 'auto',
};

const fullWidthWrapperStyle = {
  ...childrenWrapperStyle,
  width: '100%',
}

const mobileFullWidthWrapperStyle = {
  ...fullWidthWrapperStyle,
  height: 'calc(100vh - 125px)',
}

const Frame = ({ config, children, step, setStep }) => {

  const isMobile = useScreenSize();

  const getFrameStyleBasedOnCurrentTab = () => {
    if(step === STEPS.ALL_RESULTS) {
      return isMobile ? mobileFullWidthWrapperStyle : fullWidthWrapperStyle;
    } else {
      return childrenWrapperStyle;
    }
  }

  return (
    <div style={{ ...defaultMainWrapperStyle, ...config.frameStyle }}>
      {!config.widgetMode && <Header setStep={setStep}/>}
      <Tabs step={step} setStep={setStep}/>
      <div style={{ ...getFrameStyleBasedOnCurrentTab(), minHeight: `calc(${config.frameStyle.height} - 70px - 173px - 53px)` }}>
        {children}
      </div>
      {!config.widgetMode && <Footer />}
    </div>
  );
};

export default Frame;
