import './App.css';
import { useState } from 'react';
import { LandingPage } from './components/LandingPage/LandingPage';
import MapPage from './components/MapPage/MapPage';
import FormPage from './components/FormPage/FormPage';
import AllResultsPage from './components/AllResultsPage/AllResultsPage';
import Frame from './components/Frame/Frame';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { STEPS } from './constants';

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  const [step, setStep] = useState(STEPS.LANDING);
  const [manualAddress, setManualAddress] = useState(null);

  const goToMapPage = addressInfo => {
    setManualAddress(`${addressInfo.name} ${addressInfo.number}`);
    setStep(STEPS.MAP);
  };

  const renderContent = () => {
    let content = null;
    switch (step) {
      case STEPS.FORM:
        content = <FormPage setStep={setStep} goToNextStep={goToMapPage} />;
        break;
      case STEPS.MAP:
        content = <MapPage manualAddress={manualAddress} maxHeight={config.frameStyle.height ?? 500} />;
        break;
      case STEPS.ALL_RESULTS:
        content = <AllResultsPage setStep={setStep} maxHeight={config.frameStyle.height ?? 500} />;
        break;
      default:
        content = <LandingPage setStep={setStep} />;
        break;
    }
    return content;
  };

  return (
    <ThemeProvider theme={theme}>
      <Frame config={config} setStep={setStep} step={step}>
        {renderContent()}
      </Frame>
    </ThemeProvider>
  );
};

export default App;
