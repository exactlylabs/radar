import {MyTitle} from "../../../common/MyTitle";
import MyAddressInput from "./AddressInput/MyAddressInput";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import MyMapModal from "./MyMapModal";
import {DEFAULT_LINK_COLOR, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import MyCheckbox from "../../../common/MyCheckbox";

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
  margin: '30px auto 40px',
  justifyContent: 'center',
  alignItems: 'center'
}

const termsTextStyle = {
  fontSize: 14,
  width: '85%',
  color: DEFAULT_TEXT_COLOR
}

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const linkStyle = {
  color: DEFAULT_LINK_COLOR,
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

  const handleSetTerms = checked => setTerms(checked);

  return (
    <div style={locationSearchStepStyle}>
      <MyTitle text={'What is your location?'}/>
      <div style={subtitleStyle}>We’ll show your speed test results on the map.</div>
      <MyAddressInput setAddress={setAddress}/>
      { error && <MyMessageSnackbar type={'error'} message={error}/> }
      <div style={termsStyle}>
        <MyCheckbox onChange={handleSetTerms}/>
        <p style={termsTextStyle}>I agree to the Radar’s <a className={'opaque-hoverable'} style={linkStyle} href={'/terms'}>Terms of Use</a> and <a className={'opaque-hoverable'} style={linkStyle} href={'/privacy-policy'}>Privacy Policy</a>.</p>
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