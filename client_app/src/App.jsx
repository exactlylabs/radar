import './App.css';
import {useEffect, useState} from 'react';
import AllResultsPage from './components/AllResultsPage/AllResultsPage';
import Frame from './components/Frame/Frame';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material';
import { STEPS } from './constants';
import StepsPage from "./components/StepsPage/StepsPage";
import HistoryPage from "./components/HistoryPage/HistoryPage";
import {steps} from "./components/StepsPage/utils/steps";
import {RESPONSIVE_VERSION_BREAKPOINT} from "./utils/breakpoints";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({ config }) => {
  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  const [step, setStep] = useState(STEPS.SPEED_TEST);
  const [hasRecentTest, setHasRecentTest] = useState(false);
  const [givenLocation, setGivenLocation] = useState(null);
  const [specificSpeedTestStep, setSpecificSpeedTestStep] = useState(steps.CONNECTION_ADDRESS);

  useEffect(() => {

    return () => window.removeEventListener('resize', () => setIsMobileWidth(window.innerWidth <= RESPONSIVE_VERSION_BREAKPOINT));
  }, [])

  const goToMapPage = location => {
    location && setGivenLocation(location);
    setStep(STEPS.ALL_RESULTS);
  };

  const goToAllResults = () => {
    setStep(STEPS.ALL_RESULTS);
  }

  const goToHistory = (hasRecentTest) => {
    setHasRecentTest(!!hasRecentTest);
    setStep(STEPS.HISTORY);
  }

  const goToLastTest = () => {
    setSpecificSpeedTestStep(steps.SPEED_TEST_RESULTS);
    setStep(STEPS.SPEED_TEST);
  }

  const goToSpeedTest = () => {
    setSpecificSpeedTestStep(steps.CONNECTION_ADDRESS);
    setStep(STEPS.SPEED_TEST);
  }

  const renderContent = () => {
    let content = null;
    switch (step) {
      case STEPS.SPEED_TEST:
        content = <StepsPage goToAreaMap={goToMapPage} goToHistory={goToHistory} specificStep={specificSpeedTestStep}/>
        break;
      case STEPS.ALL_RESULTS:
        content = <AllResultsPage givenLocation={givenLocation}
                                  setStep={setStep}
                                  maxHeight={config.frameStyle.height ?? 500}
        />;
        break;
      case STEPS.HISTORY:
        content = <HistoryPage goToMapPage={goToMapPage}
                               goToSpeedTest={goToSpeedTest}
                               hasRecentTest={hasRecentTest}
                               goToLastTest={goToLastTest}
        />;
        break;
      default:
        content = <StepsPage goToAreaMap={goToMapPage} goToHistory={goToHistory}/>;
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
