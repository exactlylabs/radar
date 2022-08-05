import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Tabs from './Tabs';
import { DEFAULT_MAIN_SECTION_BACKGROUND_COLOR } from '../../utils/colors';

const defaultMainWrapperStyle = {
  backgroundColor: DEFAULT_MAIN_SECTION_BACKGROUND_COLOR,
};

const childrenWrapperStyle = {
  width: '90%',
  margin: '0 auto',
  overflowY: 'scroll',
};

const Frame = ({ config, children, step, setStep }) => {
  return (
    <div style={{ ...defaultMainWrapperStyle, ...config.frameStyle }}>
      {!config.widgetMode && <Header setStep={setStep} />}
      <Tabs step={step} setStep={setStep} />
      <div style={{ ...childrenWrapperStyle, height: `calc(${config.frameStyle.height} - 70px - 173px - 53px)` }}>
        {children}
      </div>
      {!config.widgetMode && <Footer />}
    </div>
  );
};

export default Frame;
