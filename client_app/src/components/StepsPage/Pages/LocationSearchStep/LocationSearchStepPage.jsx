import {MyTitle} from "../../../common/MyTitle";
import MyAddressInput from "./AddressInput/MyAddressInput";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import {useState} from "react";
import MyMapModal from "./MyMapModal";

const locationSearchStepStyle = {
  width: '100%',
  margin: '0 auto',
  position: 'relative',
  overflowY: 'hidden',
}

const termsStyle = {
  display: 'flex',
  width: '90%',
  maxWidth: 415,
  margin: '26px auto 40px',
  justifyContent: 'center',
  alignItems: 'flex-start'
}

const checkboxStyle = {
  marginRight: 10,
}

const termsTextStyle = {
  fontSize: 14,
  width: '85%',
}

const LocationSearchStepPage = ({
  goForward,
  error,
  setAddress,
  setTerms,
  isModalOpen,
  setIsModalOpen,
  checkAndOpenModal,
  currentAddress
}) => {

  return (
    <div style={locationSearchStepStyle}>
      <MyTitle text={'What is your location?'}/>
      <div>We’ll show your speed test results on the map.</div>
      <MyAddressInput setAddress={setAddress}/>
      { error && <MyMessageSnackbar type={'error'} message={error}/> }
      <div style={termsStyle}>
        <input type={'checkbox'} style={checkboxStyle} onChange={e => setTerms(e.target.checked)}/>
        <p style={termsTextStyle}>I agree to the Radar’s <a href={'/terms'}>Terms of Use</a> and <a href={'/privacy-policy'}>Privacy Policy</a>.</p>
      </div>
      <MyStepSwitcher goForward={checkAndOpenModal}/>
      <MyMapModal isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                  goForward={goForward}
                  address={currentAddress}
      />
    </div>
  )
}

export default LocationSearchStepPage;