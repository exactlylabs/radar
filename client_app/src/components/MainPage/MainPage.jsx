import {useState} from "react";
import Frame from "../Frame/Frame";
import {TABS} from "../../constants";
import {STEPS} from "../StepsPage/utils/steps";
import StepsPage from "../StepsPage/StepsPage";
import AllResultsPage from "../AllResultsPage/AllResultsPage";
import HistoryPage from "../HistoryPage/HistoryPage";
import {useHistory} from "react-router-dom";
import {useTabNavigation} from "../../hooks/useTabNavigation";

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

  const [step, setStep] = useState(getConfigTab(config.tab) ?? TABS.SPEED_TEST);
  const [hasRecentTest, setHasRecentTest] = useState(false);
  const [givenLocation, setGivenLocation] = useState(null);
  const [specificSpeedTestStep, setSpecificSpeedTestStep] = useState(STEPS.CONNECTION_ADDRESS);
  const tabNavigator = useTabNavigation();

  const goToMapPage = location => {
    tabNavigator(TABS.ALL_RESULTS);
    location && setGivenLocation(location);
    setStep(TABS.ALL_RESULTS);
  };

  const goToAllResults = () => {
    tabNavigator(TABS.ALL_RESULTS);
    setStep(TABS.ALL_RESULTS);
  }

  const goToHistory = (hasRecentTest) => {
    setHasRecentTest(!!hasRecentTest);
    tabNavigator(TABS.HISTORY);
    setStep(TABS.HISTORY);
  }

  const goToLastTest = () => {
    tabNavigator(TABS.SPEED_TEST);
    setSpecificSpeedTestStep(STEPS.SPEED_TEST_RESULTS);
    setStep(TABS.SPEED_TEST);
  }

  const goToSpeedTest = () => {
    tabNavigator(TABS.SPEED_TEST);
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
      default:
        content = <StepsPage goToAreaMap={goToMapPage} goToHistory={goToHistory}/>;
        break;
    }
    return content;
  };

  return (
    <Frame config={config} setStep={setStep} step={step}>

      {renderContent()}
    </Frame>
  )
}

export default MainPage;