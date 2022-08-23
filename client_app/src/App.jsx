import './App.css';
import { useState } from 'react';
import AllResultsPage from './components/AllResultsPage/AllResultsPage';
import Frame from './components/Frame/Frame';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { STEPS } from './constants';
import StepsPage from "./components/StepsPage/StepsPage";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  const [step, setStep] = useState(STEPS.SPEED_TEST);
  const [givenLocation, setGivenLocation] = useState(null);
  const [manualAddress, setManualAddress] = useState(null);

  const goToMapPage = location => {
    setManualAddress(true);
    setGivenLocation(location);
    setStep(STEPS.ALL_RESULTS);
  };

  const goToAllResults = () => {
    setStep(STEPS.ALL_RESULTS);
  }

  const renderContent = () => {
    let content = null;
    switch (step) {
      case STEPS.SPEED_TEST:
        content = <StepsPage goToAreaMap={goToMapPage} goToAllResults={goToAllResults}/>
        break;
      case STEPS.ALL_RESULTS:
        content = <AllResultsPage givenLocation={givenLocation} setStep={setStep} maxHeight={config.frameStyle.height ?? 500} />;
        break;
      default:
        content = <StepsPage goToAreaMap={goToMapPage} goToAllResults={goToAllResults} />;
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
