import {useContext, useEffect, useState} from "react";
import MyStepper from "./Stepper/MyStepper";
import LocationSearchStepPage from "./Pages/LocationSearchStep/LocationSearchStepPage";
import ConnectionPlacementStepPage from "./Pages/ConnectionPlacementStep/ConnectionPlacementStepPage";
import ConnectionTypeStepPage from "./Pages/ConnectionTypeStep/ConnectionTypeStepPage";
import ConnectionCostStepPage from "./Pages/ConnectionCostStep/ConnectionCostStepPage";
import SpeedTestStepPage from "./Pages/SpeedTestStep/SpeedTestStepPage";
import {errors, warnings} from "../../utils/messages";
import {STEPS} from "./utils/steps";
import {placementOptions} from "../../utils/placements";
import {types} from "../../utils/networkTypes";
import {getAddressForCoordinates, sendSpeedTestFormInformation} from "../../utils/apiRequests";
import SpeedTestResultsStepPage from "./Pages/SpeedTestResultsStep/SpeedTestResultsStepPage";
import {getLastStoredValue} from "../../utils/storage";
import NoInternetStepPage from "./Pages/NoInternetStep/NoInternetStepPage";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import InitialStepPage from "./Pages/InitialStep/InitialStepPage";
import ConfigContext from "../../context/ConfigContext";
import UserDataContext from "../../context/UserData";

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
  const [currentStep, setCurrentStep] = useState(STEPS.INITIAL);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [lastTestResults, setLastTestResults] = useState(null);
  const [canProceedToStep2, setCanProceedToStep2] = useState(false);
  const [geolocationError, setGeolocationError] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(false);
  const [confirmedAddress, setConfirmedAddress] = useState(false);

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const config = useContext(ConfigContext);
  const {userData, setUserData, setAddress, setTerms, setNetworkType, setNetworkLocation, setNetworkCost} = useContext(UserDataContext);

  useEffect(() => {
    if(specificStep) {
      setCurrentStep(specificStep);
      if (specificStep === STEPS.SPEED_TEST_RESULTS) {
        const lastTestTaken = getLastStoredValue();
        const networkLocation = placementOptions.find(placement => placement.text === lastTestTaken.networkLocation);
        const networkType = types.find(type => type.text === lastTestTaken.networkType);
        setUserData({
          ...userData,
          address: {
            coordinates: [lastTestTaken.lat, lastTestTaken.long],
            ...lastTestTaken,
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

  useEffect(() => {
    if(geolocationError) setError(errors.LOCATION_ACCESS_ERROR);
  }, [geolocationError]);

  useEffect(() => {
    setCanProceedToStep2(selectedSuggestion);
  }, [selectedSuggestion]);

  const checkAndOpenModal = (addressSync = null) => {
    setError(null);
    const { address } = userData;
    if(address.address === '' && !addressSync) {
      setError(errors.NO_LOCATION_ERROR);
    } else if(!!address.address && !canProceedToStep2 && selectedSuggestion) {
      setIsModalOpen(true);
    }
  }

  const goToInitialPage = () => {
    setCurrentStep(STEPS.INITIAL);
  }

  const goToAddressPage = () => {
    if(!userData.terms) {
      setError(errors.NO_TERMS_ERROR);
      return;
    }
    setCurrentStep(STEPS.CONNECTION_ADDRESS);
  }

  const goToPage2 = async (isConfirmingAddress = false, shouldCheckFirst = false) => {
    if(shouldCheckFirst) {
      checkAndOpenModal(isConfirmingAddress);
      return;
    }
    try {
      setError(null);
      if(!confirmedAddress && !isConfirmingAddress) {
        setIsModalOpen(true);
        return;
      }
      setConfirmedAddress(true);
      setCurrentStep(STEPS.CONNECTION_PLACEMENT);
    } catch (e) {
      setError(errors.SAVE_ERROR);
    }
  }

  const goToPage3 = () => setCurrentStep(STEPS.CONNECTION_TYPE);

  const goToPage4 = () => setCurrentStep(STEPS.CONNECTION_COST);

  const goToPage5 = () => setCurrentStep(STEPS.RUN_SPEED_TEST);

  const goToPage6 = (testResults) => {
    setLastTestResults(testResults);
    setCurrentStep(STEPS.SPEED_TEST_RESULTS);
  }

  const goToMapPage = () => goToAreaMap(userData.address.coordinates);

  function goToNoInternetPage() {
    sendSpeedTestFormInformation(userData, config.clientId)
    setCurrentStep(STEPS.NO_INTERNET);
  }

  const goToConnectionAddress = () => setCurrentStep(STEPS.CONNECTION_ADDRESS);

  const goToConnectionPlacement = () => setCurrentStep(STEPS.CONNECTION_PLACEMENT);

  const goToConnectionType = () => setCurrentStep(STEPS.CONNECTION_TYPE);

  const handleSetAddress = (address) => {
    setError(false);
    setAddress(address);
  }

  const handleSetNetworkType = index => {
    const chosenOption = types[index];
    if(chosenOption.text === 'Cellular') {
      setWarning(warnings.NOT_ENOUGH_DATA);
    } else {
      setWarning(null);
    }
    setNetworkType(chosenOption);
  };

  const handleSetNetworkLocation = index => {
    setNetworkLocation(placementOptions[index]);
  }

  const storeCoordinates = async (finalCoordinates) => {
    if(!finalCoordinates) {
      setConfirmedAddress(false);
      return;
    }
    try {
      const address = await getAddressForCoordinates(finalCoordinates, config.clientId);
      handleSetAddress(address);
      setCanProceedToStep2(true);
      setConfirmedAddress(true);
    } catch (e) {
      setError(errors.SAVE_ERROR);
    }
  }

  const getCurrentPage = () => {
    switch (currentStep) {
      case STEPS.INITIAL:
        return <InitialStepPage goToNextPage={goToAddressPage}
                                error={error}
        />;
      case STEPS.CONNECTION_ADDRESS:
        return <LocationSearchStepPage confirmAddress={storeCoordinates}
                                       error={error}
                                       setAddress={handleSetAddress}
                                       isModalOpen={isModalOpen}
                                       setIsModalOpen={setIsModalOpen}
                                       handleContinue={canProceedToStep2 ? goToPage2 : checkAndOpenModal}
                                       checkAndOpenModal={checkAndOpenModal}
                                       setGeolocationError={setGeolocationError}
                                       confirmedAddress={canProceedToStep2 && confirmedAddress}
                                       setSelectedSuggestion={setSelectedSuggestion}
                                       selectedSuggestion={selectedSuggestion}
                                       goToNextPage={goToPage2}
                                       goBack={goToInitialPage}

        />;
      case STEPS.CONNECTION_PLACEMENT:
        return <ConnectionPlacementStepPage goForward={goToPage3}
                                            goBack={goToConnectionAddress}
                                            goToLastFlowStep={goToNoInternetPage}
        />;
      case STEPS.CONNECTION_TYPE:
        return <ConnectionTypeStepPage goForward={goToPage4}
                                       goBack={goToConnectionPlacement}
                                       setSelectedOption={handleSetNetworkType}
                                       warning={warning}
        />;
      case STEPS.CONNECTION_COST:
        return <ConnectionCostStepPage goForward={goToPage5}
                                       goBack={goToConnectionType}
        />;
      case STEPS.RUN_SPEED_TEST:
        return <SpeedTestStepPage goForward={goToPage6}
                                  goBack={goToPage4}
        />;
      case STEPS.SPEED_TEST_RESULTS:
        return <SpeedTestResultsStepPage testResults={lastTestResults}
                                         goToAreaMap={goToMapPage}
                                         goToHistory={goToHistory}
                                         goToTestAgain={goToPage5}
        />;
      case STEPS.NO_INTERNET:
        return <NoInternetStepPage goToMapPage={goToMapPage}/>
      default:
        return <InitialStepPage setTerms={setTerms}
                                goToNextPage={goToAddressPage}
                                error={error}
        />;
    }
  }

  return (
    <div style={isMediumSizeScreen || isSmallSizeScreen ? mobileStepsPageStyle : stepsPageStyle}>
      {
        currentStep <= STEPS.CONNECTION_COST && currentStep !== STEPS.INITIAL &&
          <MyStepper activeStep={currentStep} isMobile={isMediumSizeScreen}/>
      }
      { getCurrentPage() }
    </div>
  );
}

export default StepsPage;