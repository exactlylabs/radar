import {MyTitle} from "../../../common/MyTitle";
import MyAddressInput from "../../AddressInput/MyAddressInput";
import MyStepSwitcher from "../../Stepper/MyStepSwitcher";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";

const locationSearchStepStyle = {
  width: '100%',
  margin: '0 auto',
}

const termsStyle = {
  display: 'flex',
  width: 'max-content',
  margin: '26px auto 40px'
}

const checkboxStyle = {
  marginRight: 10,
}

const termsTextStyle = {
  fontSize: 14
}

const LocationSearchStepPage = ({
  goForward,
  error,
  setAddress,
  setTerms
}) => {

  return (
    <div style={locationSearchStepStyle}>
      <MyTitle text={'What is your location?'}/>
      <div>We’ll show your speed test results on the map.</div>
      <MyAddressInput setAddress={setAddress}/>
      { error && <MyMessageSnackbar type={'error'} message={error}/> }
      <div style={termsStyle}>
        <input type={'checkbox'} style={checkboxStyle} onChange={e => setTerms(e.target.checked)}/>
        <div style={termsTextStyle}>I agree to the Radar’s <a href={'/terms'}>Terms of Use</a> and <a href={'/privacy-policy'}>Privacy Policy</a>.</div>
      </div>
      <MyStepSwitcher goForward={goForward}/>
    </div>
  )
}

export default LocationSearchStepPage;