import {useContext, useState} from "react";
import Frame from "../Frame/Frame";
import {TABS} from "../../constants";
import {STEPS} from "../StepsPage/utils/steps";
import StepsPage from "../StepsPage/StepsPage";
import AllResultsPage from "../AllResultsPage/AllResultsPage";
import HistoryPage from "../HistoryPage/HistoryPage";
import ConnectionContext from "../../context/ConnectionContext";
import NoInternetModal from "../common/NoInternetModal";
import OverviewPage from "../OverviewPage/OverviewPage";

const MainPage = ({config}) => {

  const getConfigTab = (tab) => {
    if(!tab) return TABS.SPEED_TEST;
    switch (tab) {
      case 0: return TABS.SPEED_TEST;
      case 1: return TABS.HISTORY;
      case 2: return TABS.ALL_RESULTS;
      default: return TABS.SPEED_TEST;
    }
  }

  const getGivenLocationIfPresent = (userLat, userLng) => {
    if(userLat === undefined || userLng === undefined) return null;
    return [userLat, userLng];
  }

  const [step, setStep] = useState(getConfigTab(config.tab) ?? TABS.SPEED_TEST);
  const [hasRecentTest, setHasRecentTest] = useState(false);
  const [givenLocation, setGivenLocation] = useState(getGivenLocationIfPresent(config.userLat, config.userLng));
  const [specificSpeedTestStep, setSpecificSpeedTestStep] = useState(STEPS.CONNECTION_ADDRESS);
  const {noInternet, setNoInternet} = useContext(ConnectionContext);

  const goToMapPage = location => {
    if(location) setGivenLocation(location);
    setStep(TABS.ALL_RESULTS);
  };

  const goToHistory = (hasRecentTest) => {
    setHasRecentTest(!!hasRecentTest);
    setStep(TABS.HISTORY);
  }

  const goToLastTest = () => {
    setSpecificSpeedTestStep(STEPS.SPEED_TEST_RESULTS);
    setStep(TABS.SPEED_TEST);
  }

  const goToSpeedTest = () => {
    setSpecificSpeedTestStep(STEPS.CONNECTION_ADDRESS);
    setStep(TABS.SPEED_TEST);
  }

  const renderContent = () => {
    let content = null;
    switch (step) {
      case TABS.SPEED_TEST:
        content = <StepsPage goToAreaMap={goToMapPage} goToHistory={goToHistory} specificStep={specificSpeedTestStep}/>
        break;
      case TABS.ALL_RESULTS:
        content = <AllResultsPage givenLocation={givenLocation}
                                  setStep={setStep}
                                  maxHeight={config.frameStyle.height ?? 500}
        />;
        break;
      case TABS.HISTORY:
        content = <HistoryPage goToMapPage={goToMapPage}
                               goToSpeedTest={goToSpeedTest}
                               hasRecentTest={hasRecentTest}
                               goToLastTest={goToLastTest}
        />;
        break;
      case TABS.OVERVIEW:
        content = <OverviewPage goToExplore={goToMapPage}
                                goToTest={goToSpeedTest}
        />;
        break;
      default:
        content = <StepsPage goToAreaMap={goToMapPage} goToHistory={goToHistory}/>;
        break;
    }
    return content;
  };

  return (
    <Frame config={config} setStep={setStep} step={step}>
      {renderContent()}
      <NoInternetModal isOpen={noInternet} closeModal={() => setNoInternet(false)}/>
    </Frame>
  )
}

export default MainPage;