import styles from './ftue_map_modal.module.css';
import sharedModalStyles from './shared_modals.module.css';
import image1 from '../../../assets/ftue-map-modal-image.svg';
import image2 from '../../../assets/ftue-map-modal-image-2.svg';
import {MyForwardButton} from "../MyForwardButton";
import {useState} from "react";

function ModalSteps({steps, currentStep}) {
  return (
    <div className={styles.stepsContainer}>
      {Array.from({length: steps}, (_, i) => i).map((step, index) => (
        <div key={index} className={styles.dash} data-current={currentStep === index}></div>
      ))}
    </div>
  )
}

export default function FTUEMapModal({closeModal}) {

  const [step, setStep] = useState(0);

  const stepOne = () => (
    <>
      <ModalSteps steps={2} currentStep={0} />
      <img src={image1} alt={'FTUE Map Modal Image'} className={sharedModalStyles.mainImage}/>
      <h5 className={sharedModalStyles.header}>Explore speed test results</h5>
      <p className={sharedModalStyles.subtext}>Click on the dots on the map to view the details of speed test results, and adjust the filters on the left to explore more results.</p>
      <MyForwardButton text={'Next'} customCss={{width: '75%', maxWidth: '200px', margin: '0 auto'}} onClick={() => setStep(1)}/>
    </>
  )

  const stepTwo = () => (
    <>
      <ModalSteps steps={2} currentStep={1} />
      <img src={image2} alt={'FTUE Map Modal Image'} className={sharedModalStyles.mainImage}/>
      <h5 className={sharedModalStyles.header}>Filter by Classifications and Speeds</h5>
      <p className={sharedModalStyles.subtext}>Test results are classified by the lower download or upload speed. Use map views to switch between classifications or view speeds independently.</p>
      <MyForwardButton text={'Get started'} customCss={{width: '75%', maxWidth: '200px', margin: '0 auto'}} onClick={closeModal}/>
    </>
  );

  return step === 0 ? stepOne() : stepTwo();
}