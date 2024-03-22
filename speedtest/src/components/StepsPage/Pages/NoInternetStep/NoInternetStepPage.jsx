import {MyTitle} from "../../../common/MyTitle";
import {MyForwardButton} from "../../../common/MyForwardButton";
import CheckIcon from '../../../../assets/check-icon.png';
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import {useEffect, useState} from "react";
import {getSessionValue, isKeyInSession} from "../../../../utils/session";
import {persistContactData} from "../../../../utils/apiRequests";
import {notifyError} from "../../../../utils/errors";
import ContactInfoModal from "../SpeedTestResultsStep/ContactInfoModal/ContactInfoModal";
import AnimatedBanner from "../../../common/AnimatedBanner";
import SubmittedInfoBanner from "../../../common/banners/SubmittedInfo/SubmittedInfoBanner";
import JoinUsBanner from "../../../common/banners/JoinUs/JoinUsBanner";

const noInternetStepPageStyle = {
  width: '45%',
  margin: '0 auto',
  maxWidth: 580,
  position: 'relative'
}

const mobileNoInternetStepPageStyle = {
  ...noInternetStepPageStyle,
  width: '95%',
}

const firstLineStyle = {
  color: DEFAULT_TEXT_COLOR
}

const secondLineStyle = {
  color: DEFAULT_TEXT_COLOR,
  marginBottom: 40,
  marginTop: 10,
}

const buttonWrapperStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '0 auto 90px'
}

const checkIconStyle = {
  marginBottom: 20,
  marginTop: 30,
}

const SUBMISSION_STATES = {
  MISSING: 'missing',
  JUST_SUBMITTED: 'just_submitted',
  ALREADY_SUBMITTED: 'already_submitted'
}

const NoInternetStepPage = ({
  goToMapPage,
  lastTest
}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [hasSubmittedInfo, setHasSubmittedInfo] = useState(isKeyInSession('contactInfo') ? SUBMISSION_STATES.ALREADY_SUBMITTED : SUBMISSION_STATES.MISSING);

  useEffect(() => {
    if(hasSubmittedInfo === SUBMISSION_STATES.MISSING) {
      setTimeout(openContactInfoModal, 1000);
    } else {
      const contactInfo = JSON.parse(getSessionValue('contactInfo'));
      persistContactData(contactInfo, lastTest.id)
        .catch(notifyError);
    }
  }, []);

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
    let style;
    if (isMediumSizeScreen || isSmallSizeScreen) style = {...mobileNoInternetStepPageStyle};
    else style = {...noInternetStepPageStyle};

    if(hasSubmittedInfo === SUBMISSION_STATES.MISSING || hasSubmittedInfo === SUBMISSION_STATES.JUST_SUBMITTED) {
      style['paddingTop'] = '2rem';
    }

    return style;
  }

  return (
    <div style={getContainerStyle()}>
      { (hasSubmittedInfo === SUBMISSION_STATES.MISSING || hasSubmittedInfo === SUBMISSION_STATES.JUST_SUBMITTED) &&
        <AnimatedBanner>
          {hasSubmittedInfo === SUBMISSION_STATES.JUST_SUBMITTED ? <SubmittedInfoBanner/> : <JoinUsBanner openModal={openContactInfoModal}/>}
        </AnimatedBanner>
      }
      <img style={checkIconStyle} src={CheckIcon} width={42} height={42} alt={'check-icon'}/>
      <MyTitle text={'Thanks for letting us know.'}/>
      <div style={firstLineStyle}>While we cannot run a speed test at your location as you don't have Internet, we do appreciate your information that helps us learn more about which areas are currently not served.</div>
      <div style={secondLineStyle}>You can explore the map to see how others compare to you.</div>
      <div style={buttonWrapperStyle}>
        <MyForwardButton text={'Explore the map'}
                         onClick={goToMapPage}
        />
      </div>
      <ContactInfoModal isOpen={isContactModalOpen}
                        closeModal={handleCloseModal}
                        speedTestId={lastTest.id}
      />
    </div>
  )
}

export default NoInternetStepPage;