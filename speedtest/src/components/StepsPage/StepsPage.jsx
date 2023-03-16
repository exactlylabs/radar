import {useEffect, useState} from "react";
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
import {getAddressForCoordinates} from "../../utils/apiRequests";
import SpeedTestResultsStepPage from "./Pages/SpeedTestResultsStep/SpeedTestResultsStepPage";
import {getLastStoredValue} from "../../utils/storage";
import NoInternetStepPage from "./Pages/NoInternetStep/NoInternetStepPage";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import InitialStepPage from "./Pages/InitialStep/InitialStepPage";

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

export const emptyAddress = {
  address: '',
  coordinates: [],
  city: '',
  street: '',
  state: '',
  postal_code: '',
  house_number: ''
};

const StepsPage = ({
  goToAreaMap,
  goToHistory,
  specificStep,
}) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.INITIAL);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [userStepData, setUserStepData] = useState({
    address: emptyAddress,
    terms: false,
    networkLocation: null,
    networkType: null,
    networkCost: '', // init with empty string to prevent console error regarding controlled vs. uncontrolled input value change
  });
  const [lastTestResults, setLastTestResults] = useState(null);
  const [canProceedToStep2, setCanProceedToStep2] = useState(false);
  const [geolocationError, setGeolocationError] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(false);
  const [confirmedAddress, setConfirmedAddress] = useState(false);

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  const setAddress = address => {
    setError(false);
    setUserStepData(prevState => ({...prevState, address}));
  }
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
      if (specificStep === STEPS.SPEED_TEST_RESULTS) {
        const lastTestTaken = getLastStoredValue();
        const networkLocation = placementOptions.find(placement => placement.text === lastTestTaken.networkLocation);
        const networkType = types.find(type => type.text === lastTestTaken.networkType);
        setUserStepData({
          ...userStepData,
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
    const { address } = userStepData;
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
    if(!userStepData.terms) {
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

  const goToMapPage = () => goToAreaMap(userStepData.address.coordinates);

  const goToNoInternetPage = () => setCurrentStep(STEPS.NO_INTERNET);

  const goToConnectionAddress = () => setCurrentStep(STEPS.CONNECTION_ADDRESS);

  const goToConnectionPlacement = () => setCurrentStep(STEPS.CONNECTION_PLACEMENT);

  const goToConnectionType = () => setCurrentStep(STEPS.CONNECTION_TYPE);

  const storeCoordinates = async (finalCoordinates) => {
    if(!finalCoordinates) {
      setConfirmedAddress(false);
      return;
    }
    try {
      const address = await getAddressForCoordinates(finalCoordinates);
      setAddress(address);
      setCanProceedToStep2(true);
      setConfirmedAddress(true);
    } catch (e) {
      setError(errors.SAVE_ERROR);
    }
  }

  const getCurrentPage = () => {
    switch (currentStep) {
      case STEPS.INITIAL:
        return <InitialStepPage terms={userStepData.terms}
                                setTerms={setTerms}
                                goToNextPage={goToAddressPage}
                                error={error}
        />;
      case STEPS.CONNECTION_ADDRESS:
        return <LocationSearchStepPage confirmAddress={storeCoordinates}
                                       error={error}
                                       setAddress={setAddress}
                                       isModalOpen={isModalOpen}
                                       setIsModalOpen={setIsModalOpen}
                                       handleContinue={canProceedToStep2 ? goToPage2 : checkAndOpenModal}
                                       checkAndOpenModal={checkAndOpenModal}
                                       currentAddress={userStepData.address}
                                       setGeolocationError={setGeolocationError}
                                       confirmedAddress={canProceedToStep2 && confirmedAddress}
                                       setSelectedSuggestion={setSelectedSuggestion}
                                       selectedSuggestion={selectedSuggestion}
                                       goToNextPage={canProceedToStep2 ? goToPage2 : undefined}
                                       goBack={goToInitialPage}

        />;
      case STEPS.CONNECTION_PLACEMENT:
        return <ConnectionPlacementStepPage goForward={goToPage3}
                                            goBack={goToConnectionAddress}
                                            setSelectedOption={setNetworkLocation}
                                            selectedOption={userStepData.networkLocation}
                                            address={userStepData.address.address}
                                            goToLastFlowStep={goToNoInternetPage}
        />;
      case STEPS.CONNECTION_TYPE:
        return <ConnectionTypeStepPage goForward={goToPage4}
                                       goBack={goToConnectionPlacement}
                                       selectedOption={userStepData.networkType}
                                       setSelectedOption={setNetworkType}
                                       warning={warning}
        />;
      case STEPS.CONNECTION_COST:
        return <ConnectionCostStepPage goForward={goToPage5}
                                       goBack={goToConnectionType}
                                       setCost={setNetworkCost}
                                       cost={userStepData.networkCost}
        />;
      case STEPS.RUN_SPEED_TEST:
        return <SpeedTestStepPage userStepData={userStepData}
                                  goForward={goToPage6}
                                  goBack={goToPage4}
        />;
      case STEPS.SPEED_TEST_RESULTS:
        return <SpeedTestResultsStepPage testResults={lastTestResults}
                                         userStepData={userStepData}
                                         goToAreaMap={goToMapPage}
                                         goToHistory={goToHistory}
                                         goToTestAgain={goToPage5}
        />;
      case STEPS.NO_INTERNET:
        return <NoInternetStepPage goToMapPage={goToMapPage}/>
      default:
        return <InitialStepPage terms={userStepData.terms}
                                setTerms={setTerms}
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