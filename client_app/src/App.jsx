import './App.css';
import {useState} from "react";
import {LandingPage} from "./components/LandingPage/LandingPage";
import MapPage from "./components/MapPage/MapPage";
import FormPage from "./components/FormPage/FormPage";

// Application entry point, would hold all logic for state management
// of multistep process
const App = ({config}) => {

  const [step, setStep] = useState('landing');
  const [manualAddress, setManualAddress] = useState(null);
  console.log(config);
  const goToNextStep = option => {
    if(option === 'manually') setStep('form');
    else setStep('map');
  }

  const goToMapPage = (addressInfo) => {
    setManualAddress(`${addressInfo.name} ${addressInfo.number}`);
    setStep('map');
  }

  return (
    <div style={{backgroundColor: config.backgroundColor || 'white'}}>
      {
        step === 'landing' && <LandingPage goToNextStep={goToNextStep}/>
      }
      {
        step === 'form' && <FormPage goToNextStep={goToMapPage}/>
      }
      {
        step === 'map' && <MapPage manualAddress={manualAddress}/>
      }
    </div>
  )
}

export default App;
