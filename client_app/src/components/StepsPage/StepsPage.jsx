import {useEffect, useState} from "react";
import MyStepper from "./Stepper/MyStepper";
import LocationSearchStepPage from "./Pages/LocationSearchStep/LocationSearchStepPage";
import ConnectionPlacementStepPage from "./Pages/ConnectionPlacementStep/ConnectionPlacementStepPage";
import ConnectionTypeStepPage from "./Pages/ConnectionTypeStep/ConnectionTypeStepPage";
import ConnectionCostStepPage from "./Pages/ConnectionCostStep/ConnectionCostStepPage";
import SpeedTestStepPage from "./Pages/SpeedTestStep/SpeedTestStepPage";
import {errors, warnings} from "../../utils/messages";
import {steps} from "./utils/steps";
import {placementOptions} from "../../utils/placements";
import {types} from "../../utils/networkTypes";

const stepsPageStyle = {
  width: '40%',
  margin: '0 auto',
  textAlign: 'center',
  paddingTop: 40,
}

const StepsPage = () => {

  const [currentStep, setCurrentStep] = useState(steps.CONNECTION_ADDRESS);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [userStepData, setUserStepData] = useState({
    address: null,
    confirmedLocation: true, // TODO: change to false and create location confirmation modal
    terms: false,
    networkLocation: null,
    networkType: null,
    networkCost: null,
  });

  const setAddress = address => setUserStepData({...userStepData, address});
  const setTerms = status => setUserStepData({...userStepData, terms: status});
  const setNetworkLocation = index => setUserStepData({ ...userStepData, networkLocation: placementOptions[index] });
  const setNetworkType = index => {
    const chosenOption = types[index];
    if(chosenOption.text === 'Cellular') {
      setWarning(warnings.NOT_ENOUGH_DATA);
    } else {
      setWarning(null);
    }
    setUserStepData({ ...userStepData, networkType: chosenOption});
  };
  const setNetworkCost = cost => setUserStepData({ ...userStepData, networkCost: cost });

  const goToPage2 = () => {
    setError(null);
    const { address, confirmedLocation, terms } = userStepData;
    if(!address) {
      setError(errors.NO_LOCATION_ERROR);
    } else if(!terms) {
      setError(errors.NO_TERMS_ERROR);
    } else if(address && confirmedLocation && terms) {
      setCurrentStep(steps.CONNECTION_PLACEMENT);
    }
  }

  const goToPage3 = () => setCurrentStep(steps.CONNECTION_TYPE);

  const goToPage4 = () => setCurrentStep(steps.CONNECTION_COST);

  const goToPage5 = () => setCurrentStep(steps.RUN_SPEED_TEST);

  return (
    <div style={stepsPageStyle}>
      {
        currentStep < steps.CONNECTION_COST &&
          <MyStepper activeStep={currentStep}/>
      }
      {
        currentStep === steps.CONNECTION_ADDRESS &&
        <LocationSearchStepPage goForward={goToPage2}
                                error={error}
                                setAddress={setAddress}
                                setTerms={setTerms}
        />
      }
      {
        currentStep === steps.CONNECTION_PLACEMENT &&
        <ConnectionPlacementStepPage goForward={goToPage3}
                                     goBack={() => setCurrentStep(steps.CONNECTION_ADDRESS)}
                                     setSelectedOption={setNetworkLocation}
                                     selectedOption={userStepData.networkLocation}
        />
      }
      {
        currentStep === steps.CONNECTION_TYPE &&
        <ConnectionTypeStepPage goForward={goToPage4}
                                goBack={() => setCurrentStep(steps.CONNECTION_PLACEMENT)}
                                selectedOption={userStepData.networkType}
                                setSelectedOption={setNetworkType}
                                warning={warning}
        />
      }
      {
        currentStep === steps.CONNECTION_COST &&
        <ConnectionCostStepPage goForward={goToPage5}
                                goBack={() => setCurrentStep(steps.CONNECTION_TYPE)}
                                setCost={setNetworkCost}
                                cost={userStepData.networkCost}
        />
      }
      {
        currentStep === steps.RUN_SPEED_TEST &&
        <SpeedTestStepPage userStepData={userStepData}/>
      }
    </div>
  );
}

export default StepsPage;