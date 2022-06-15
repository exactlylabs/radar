import './App.css';
import {useState} from "react";
import {LandingPage} from "./components/LandingPage/LandingPage";
import MapPage from "./components/MapPage/MapPage";
import FormPage from "./components/FormPage/FormPage";
import AllResultsPage from "./components/AllResultsPage/AllResultsPage";
import Frame from "./components/Frame/Frame";
import {createTheme, responsiveFontSizes, ThemeProvider} from "@mui/material";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({config}) => {

  let theme = createTheme();
  theme = responsiveFontSizes(theme);

  const [step, setStep] = useState('landing');
  const [manualAddress, setManualAddress] = useState(null);

  const goToMapPage = (addressInfo) => {
    setManualAddress(`${addressInfo.name} ${addressInfo.number}`);
    setStep('map');
  }

  return (
    <ThemeProvider theme={theme}>
      <Frame config={config} setStep={setStep} step={step}>
        {
          step === 'landing' && <LandingPage setStep={setStep}/>
        }
        {
          step === 'form' && <FormPage setStep={setStep} goToNextStep={goToMapPage}/>
        }
        {
          step === 'map' && <MapPage manualAddress={manualAddress} setStep={setStep} maxHeight={config.frameStyle.height ?? 500}/>
        }
        {
          step === 'allResults' && <AllResultsPage setStep={setStep} maxHeight={config.frameStyle.height ?? 500}/>
        }
      </Frame>
    </ThemeProvider>
  )
}

export default App;
