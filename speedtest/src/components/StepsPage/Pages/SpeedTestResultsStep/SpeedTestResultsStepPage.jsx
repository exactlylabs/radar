import {MyTitle} from "../../../common/MyTitle";
import TestStatsTableContent from "../SpeedTestStep/TestStatsTable";
import {MyBackButton} from "../../../common/MyBackButton";
import {MyForwardButton} from "../../../common/MyForwardButton";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import React, {useContext, useEffect, useState} from "react";
import ConfigContext from "../../../../context/ConfigContext";
import AnimatedBanner from "../../../common/AnimatedBanner";
import SubmittedInfoBanner from "../../../common/banners/SubmittedInfo/SubmittedInfoBanner";
import JoinUsBanner from "../../../common/banners/JoinUs/JoinUsBanner";
import {getSessionValue, isKeyInSession} from "../../../../utils/session";
import ContactInfoModal from "./ContactInfoModal/ContactInfoModal";
import {persistContactData} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import {CircularProgress} from "@mui/material";
import {getLastStoredValue} from "../../../../utils/storage";

const speedTestResultsContainerStyle = {
  paddingTop: '4rem',
  position: 'relative',
}

const widgetSpeedTestResultsContainerStyle = speedTestResultsContainerStyle;

const buttonFooterStyle = {
  display: 'flex',
  flexDirection: 'row',
  margin: '35px auto 70px',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  minWidth: 300,
  marginBottom: 120,
  marginTop: 42,
}

const mobileButtonFooterStyle = {
  ...buttonFooterStyle,
  margin: '35px auto 70px',
}

const SUBMISSION_STATES = {
  MISSING: 'missing',
  JUST_SUBMITTED: 'just_submitted',
  ALREADY_SUBMITTED: 'already_submitted'
}

const SpeedTestResultsStepPage = ({
  testResults,
  goToAreaMap,
  goToTestAgain
}) => {

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const config = useContext(ConfigContext);
  const {isMediumSizeScreen} = useViewportSizes();
  const [hasSubmittedInfo, setHasSubmittedInfo] = useState(isKeyInSession('contactInfo') ? SUBMISSION_STATES.ALREADY_SUBMITTED : SUBMISSION_STATES.MISSING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(!testResults);
    if(testResults) {
      if (hasSubmittedInfo === SUBMISSION_STATES.MISSING) {
        setTimeout(openContactInfoModal, 1000);
      } else {
        const contactInfo = JSON.parse(getSessionValue('contactInfo'));
        persistContactData(contactInfo, testResults.id)
          .catch(notifyError);
      }
    }
  }, [testResults]);

  const openContactInfoModal = (e) => {
    if(e) e.preventDefault();
    setIsContactModalOpen(true);
  }

  const handleCloseModal = (e) => {
    if(e) e.preventDefault();
    if(isKeyInSession('contactInfo') && hasSubmittedInfo === SUBMISSION_STATES.MISSING) {
      setHasSubmittedInfo(SUBMISSION_STATES.JUST_SUBMITTED);
    }
    setIsContactModalOpen(false);
  }

  const getContainerStyle = () => {
    let style = config.widgetMode ? {...widgetSpeedTestResultsContainerStyle} : {...speedTestResultsContainerStyle};
    if(!config.widgetMode && hasSubmittedInfo === SUBMISSION_STATES.ALREADY_SUBMITTED) {
      style['paddingTop'] = '8px';
    }
    return style;
  }

  return (
    <div style={getContainerStyle()}>
      { loading ? <CircularProgress size={25} /> :
        <>
          { (hasSubmittedInfo === SUBMISSION_STATES.MISSING || hasSubmittedInfo === SUBMISSION_STATES.JUST_SUBMITTED) &&
            <AnimatedBanner>
              {hasSubmittedInfo === SUBMISSION_STATES.JUST_SUBMITTED ? <SubmittedInfoBanner/> : <JoinUsBanner openModal={openContactInfoModal}/>}
            </AnimatedBanner>
          }
          <MyTitle text={'Your test results'}/>
          <TestStatsTableContent extended
                                 latencyValue={testResults.latency.toFixed(0)}
                                 downloadValue={testResults.downloadValue.toFixed(2)}
                                 uploadValue={testResults.uploadValue.toFixed(2)}
                                 lossValue={testResults.loss.toFixed(2)}
          />
          <div style={isMediumSizeScreen ? mobileButtonFooterStyle : buttonFooterStyle}>
            <MyBackButton text={'Test again'} onClick={goToTestAgain}/>
            <MyForwardButton text={'Explore the map'} onClick={goToAreaMap}/>
          </div>
          <ContactInfoModal isOpen={isContactModalOpen}
                            closeModal={handleCloseModal}
                            speedTestId={testResults.id}
          />
        </>
      }
    </div>
  )
}

export default SpeedTestResultsStepPage;