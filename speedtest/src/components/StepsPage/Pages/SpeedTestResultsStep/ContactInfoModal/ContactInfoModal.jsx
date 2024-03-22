import {useState} from "react";
import {MyForwardButton} from "../../../../common/MyForwardButton";
import rightArrowWhite from "../../../../../assets/right-arrow-white.png";
import CustomModal from "../../../../common/modals/CustomModal";
import InitialContactInfo from "./InitialContactInfo/InitialContactInfo";
import SecondaryContactInfo from "./SecondaryContactInfo/SecondaryContactInfo";
import {MyBackButton} from "../../../../common/MyBackButton";
import styles from './contact_info_modal.module.css';
import iconLeftArrow from "../../../../../assets/icons-left-arrow.png";
import {persistContactData} from "../../../../../utils/apiRequests";
import {notifyError} from "../../../../../utils/errors";
import {setSessionValue} from "../../../../../utils/session";

const ContactInfoModal = ({isOpen, closeModal, speedTestId}) => {

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(currentStep === 0) {
      setCurrentStep(1);
    } else {
      closeModal();
    }
    try {
      await persistContactData(formData, speedTestId);
      setSessionValue('contactInfo', JSON.stringify(formData));
    } catch(err) {
      notifyError(err);
    }
  }

  const handleInputsChange = e => {
    const inputName = e.target.name;
    const value = e.target.value;
    const newValue = {};
    newValue[inputName] = value;
    setFormData(prevState => ({...prevState, ...newValue}));
  }

  return (
    <CustomModal isOpen={isOpen} closeModal={closeModal}>
      <div className={styles.stepsContainer}>
        <div className={styles.dash} data-current={true}></div>
        <div className={styles.dash} data-current={currentStep === 1}></div>
      </div>
      <h4 className={styles.title}>Join our effort today</h4>
      <p className={styles.subtitle}>Help us study broadband in your region.</p>
      { currentStep === 0 ? <InitialContactInfo handleInputChange={handleInputsChange}/> : <SecondaryContactInfo handleInputChange={handleInputsChange}/> }
      <div className={styles.buttonsContainer}>
        { currentStep === 1 && <MyBackButton iconFirst icon={<img src={iconLeftArrow} alt={'go back arrow icon'} width={14} height={14}/>} text={'Go back'} onClick={() => setCurrentStep(0)}/> }
        <MyForwardButton onClick={handleSubmit}
                         text={currentStep === 0 ? 'Continue' : 'Submit details'}
                         icon={currentStep === 0 ? <img src={rightArrowWhite} alt={'location-button-icon'} width={14} height={14}/> : null}
        />
      </div>
    </CustomModal>
  )
}

export default ContactInfoModal;