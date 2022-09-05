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
import {getAddressForCoordinates} from "../../utils/apiRequests";
import SpeedTestResultsStepPage from "./Pages/SpeedTestResultsStep/SpeedTestResultsStepPage";
import {getLastStoredValue} from "../../utils/storage";
import {useIsMediumSizeScreen} from "../../hooks/useIsMediumSizeScreen";
import {useIsSmallSizeScreen} from "../../hooks/useIsSmallSizeScreen";

const stepsPageStyle = {
  width: '100%',
  margin: '0 auto',
  textAlign: 'center',
  paddingTop: 40,
}

const mobileStepsPageStyle = {
  ...stepsPageStyle,
  paddingTop: 0,
}

const StepsPage = ({
  goToAreaMap,
  goToHistory,
  specificStep,
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(steps.CONNECTION_ADDRESS);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [userStepData, setUserStepData] = useState({
    address: {
      address: '',
      coordinates: [],
      city: '',
      street: '',
      state: '',
      postal_code: '',
      house_number: ''
    },
    confirmedLocation: true, // TODO: change to false and create location confirmation modal
    terms: false,
    networkLocation: null,
    networkType: null,
    networkCost: undefined,
  });
  const [lastTestResults, setLastTestResults] = useState(null);
  const isMediumSizeScreen = useIsMediumSizeScreen();
  const isSmallSizeScreen = useIsSmallSizeScreen();

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

  useEffect(() => {
    if(specificStep) {
      setCurrentStep(specificStep);
      if (specificStep === steps.SPEED_TEST_RESULTS) {
        const lastTestTaken = getLastStoredValue();
        const networkLocation = placementOptions.find(placement => placement.text === lastTestTaken.networkLocation);
        const networkType = types.find(type => type.text === lastTestTaken.networkType);
        setUserStepData({
          ...userStepData,
          address: {
            address: lastTestTaken.address,
            coordinates: [lastTestTaken.lat, lastTestTaken.long]
          },
          terms: true,
          networkLocation: networkLocation,
          networkType: networkType,
        });
        setLastTestResults({
          downloadValue: lastTestTaken.download,
          uploadValue: lastTestTaken.upload,
          loss: lastTestTaken.loss,
          latency: lastTestTaken.latency,
        });
      }
    }
  }, []);

  const checkAndOpenModal = () => {
    setError(null);
    const { address, confirmedLocation, terms } = userStepData;
    if(address.address === '') {
      setError(errors.NO_LOCATION_ERROR);
    } else if(!terms) {
      setError(errors.NO_TERMS_ERROR);
    } else if(address.name !== '' && confirmedLocation && terms) {
      setIsModalOpen(true);
    }
  }

  const goToPage2 = async (finalCoordinates) => {
    try {
      const address = await getAddressForCoordinates(finalCoordinates);
      setAddress(address);
      setCurrentStep(steps.CONNECTION_PLACEMENT);
    } catch (e) {
      setError('There was an error saving your address! Please try again later.');
    }
  }

  const goToPage3 = () => setCurrentStep(steps.CONNECTION_TYPE);

  const goToPage4 = () => setCurrentStep(steps.CONNECTION_COST);

  const goToPage5 = () => setCurrentStep(steps.RUN_SPEED_TEST);

  const goToPage6 = (testResults) => {
    setLastTestResults(testResults);
    setCurrentStep(steps.SPEED_TEST_RESULTS);
  }

  const goToMapPage = () => goToAreaMap(userStepData.address.coordinates);

  const getCurrentPage = () => {
    switch (currentStep) {
      case steps.CONNECTION_ADDRESS:
        return <LocationSearchStepPage goForward={goToPage2}
                                       error={error}
                                       setAddress={setAddress}
                                       setTerms={setTerms}
                                       isModalOpen={isModalOpen}
                                       setIsModalOpen={setIsModalOpen}
                                       checkAndOpenModal={checkAndOpenModal}
                                       currentAddress={userStepData.address}
        />;
      case steps.CONNECTION_PLACEMENT:
        return <ConnectionPlacementStepPage goForward={goToPage3}
                                            goBack={() => setCurrentStep(steps.CONNECTION_ADDRESS)}
                                            setSelectedOption={setNetworkLocation}
                                            selectedOption={userStepData.networkLocation}
        />;
      case steps.CONNECTION_TYPE:
        return <ConnectionTypeStepPage goForward={goToPage4}
                                       goBack={() => setCurrentStep(steps.CONNECTION_PLACEMENT)}
                                       selectedOption={userStepData.networkType}
                                       setSelectedOption={setNetworkType}
                                       warning={warning}
        />;
      case steps.CONNECTION_COST:
        return <ConnectionCostStepPage goForward={goToPage5}
                                       goBack={() => setCurrentStep(steps.CONNECTION_TYPE)}
                                       setCost={setNetworkCost}
                                       cost={userStepData.networkCost}
        />;
      case steps.RUN_SPEED_TEST:
        return <SpeedTestStepPage userStepData={userStepData}
                                  goForward={goToPage6}
        />;
      case steps.SPEED_TEST_RESULTS:
        return <SpeedTestResultsStepPage testResults={lastTestResults}
                                         userStepData={userStepData}
                                         goToAreaMap={goToMapPage}
                                         goToHistory={goToHistory}
                                         goToTestAgain={goToPage5}
        />;
      default:
        return <LocationSearchStepPage goForward={goToPage2}
                                       error={error}
                                       setAddress={setAddress}
                                       setTerms={setTerms}
                                       isModalOpen={isModalOpen}
                                       setIsModalOpen={setIsModalOpen}
                                       checkAndOpenModal={checkAndOpenModal}
                                       currentAddress={userStepData.address}
        />;
    }
  }

  return (
    <div style={isMediumSizeScreen || isSmallSizeScreen ? mobileStepsPageStyle : stepsPageStyle}>
      {
        currentStep <= steps.CONNECTION_COST &&
          <MyStepper activeStep={currentStep} isMobile={isMediumSizeScreen}/>
      }
      { getCurrentPage() }
    </div>
  );
}

export default StepsPage;