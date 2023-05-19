import {MyTitle} from "../common/MyTitle";
import MyHistoricalValuesTable from "./MyHistoricalValuesTable";
import {MyBackButton} from "../common/MyBackButton";
import {ArrowBack} from "@mui/icons-material";
import {MyForwardButton} from "../common/MyForwardButton";
import {MyButton} from "../common/MyButton";
import {getStoredValues} from "../../utils/storage";
import {useState} from "react";
import MyMeasurementInfoModal from "./MyMeasurementInfoModal";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import iconLeftArrow from "../../assets/icons-left-arrow.png";

const historyPageStyle = {
  width: '100%',
  margin: '0 auto',
  textAlign: 'center',
  paddingTop: 40,
}

const buttonsContainerStyle = {
  width: 380,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '50px auto',
}

const mobileButtonsContainerStyle = {
  ...buttonsContainerStyle,
  width: '100%',
  flexDirection: 'column',
  height: 110,
  justifyContent: 'space-between',
  margin: '30px auto'
}

const emptyStateTextStyle = {
  marginBottom: 20,
}

const emptyStateStyle = {
  width: '50%',
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}

const arrowIconStyle = {
  width: '14px',
  height: '14px',
  marginRight: '15px',
  marginLeft: '-4px'
}

const HistoryPage = ({
  goToMapPage,
  goToSpeedTest,
  goToLastTest,
  hasRecentTest,
}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const historicalValues = getStoredValues();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);

  const openMeasurementInfoModal = measurement => {
    setCurrentMeasurement(measurement);
    setIsModalOpen(true);
  }

  const getButtonsStyle = () => {
    let style;
    if((isMediumSizeScreen || isSmallSizeScreen) && hasRecentTest) style = mobileButtonsContainerStyle;
    else if((isMediumSizeScreen || isSmallSizeScreen) && !hasRecentTest) style = {...mobileButtonsContainerStyle, justifyContent: 'flex-start'};
    else style = {...buttonsContainerStyle, justifyContent: hasRecentTest ? 'space-between' : 'center'};
    return style;
  }


  const goToMapPageWithNoCoordinates = () => goToMapPage(null)

  return (
    <div style={historyPageStyle}>
      <MyTitle text={'All your results'}/>
      {
        !historicalValues &&
        <div style={emptyStateStyle}>
          <div style={emptyStateTextStyle}>You have not taken any speed tests so far!</div>
          <MyButton text={'Take your first test'} onClick={goToSpeedTest}/>
        </div>
      }
      {
        !!historicalValues &&
        <MyHistoricalValuesTable values={historicalValues} openMeasurementInfoModal={openMeasurementInfoModal}/>
      }
      <div style={getButtonsStyle()}>
        {
          hasRecentTest &&
          <MyBackButton text={'Go to last test'}
                        icon={<img src={iconLeftArrow} alt={'go back arrow icon'} style={arrowIconStyle}/>}
                        iconFirst
                        onClick={goToLastTest}
          />
        }
        <MyForwardButton text={'Explore the map'} onClick={goToMapPageWithNoCoordinates} />
      </div>
      {
        (isMediumSizeScreen || isSmallSizeScreen) &&
        <MyMeasurementInfoModal isOpen={isModalOpen}
                                setIsOpen={setIsModalOpen}
                                measurement={currentMeasurement}
        />
      }
    </div>
  )
}

export default HistoryPage;