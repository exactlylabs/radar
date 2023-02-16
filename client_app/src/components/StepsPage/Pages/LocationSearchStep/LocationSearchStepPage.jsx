import {useState} from "react";
import {MyTitle} from "../../../common/MyTitle";
import MyAddressInput from "./AddressInput/MyAddressInput";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import MyMapModal from "./MyMapModal";
import {DEFAULT_LINK_COLOR, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import MyCheckbox from "../../../common/MyCheckbox";
import SuggestionsModal from "./SuggestionsModal";

const locationSearchStepStyle = {
  width: '100%',
  margin: '0 auto',
  position: 'relative',
}

const termsStyle = {
  display: 'flex',
  width: 'max-content',
  maxWidth: '90%',
  margin: '30px auto 40px',
  justifyContent: 'center',
  alignItems: 'center'
}

const termsTextStyle = {
  fontSize: 14,
  color: DEFAULT_TEXT_COLOR
}

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const linkStyle = {
  color: DEFAULT_LINK_COLOR,
}

const LocationSearchStepPage = ({
  confirmAddress,
  error,
  setAddress,
  setTerms,
  isModalOpen,
  setIsModalOpen,
  handleContinue,
  currentAddress,
  setGeolocationError,
  confirmedAddress,
  setSelectedSuggestion,
  selectedSuggestion,
  goToNextPage,
  terms
}) => {

  const [isGenericLocationModalOpen, setIsGenericLocationModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const handleSetTerms = checked => setTerms(checked);

  const openGenericLocationModal = () => setIsGenericLocationModalOpen(true);
  const openSuggestionsModal = () => setIsSuggestionsModalOpen(true);
  const goToGenericModal = () => {
    setIsSuggestionsModalOpen(false);
    setIsGenericLocationModalOpen(true);
  }

  const handleGoToMapModalFromSuggestion = (selectedSuggestionIndex) => {
    const selectedSuggestion = suggestions[selectedSuggestionIndex];
    setAddress(selectedSuggestion);
    setIsSuggestionsModalOpen(false);
    setIsModalOpen(true);
  }

  const closeSuggestionsModal = () => setIsSuggestionsModalOpen(false);

  return (
    <div style={locationSearchStepStyle}>
      <MyTitle text={'What is your location?'}/>
      <div style={subtitleStyle}>We’ll show your speed test results on the map.</div>
      <MyAddressInput setAddress={setAddress}
                      handleContinue={handleContinue}
                      currentAddress={currentAddress}
                      setGeolocationError={setGeolocationError}
                      openGenericLocationModal={openGenericLocationModal}
                      confirmedAddress={confirmedAddress}
                      setSelectedSuggestion={setSelectedSuggestion}
                      openSuggestionsModal={openSuggestionsModal}
                      selectedSuggestion={selectedSuggestion}
                      suggestions={suggestions}
                      setSuggestions={setSuggestions}
      />
      { error && <MyMessageSnackbar type={'error'} message={error}/> }
      <div style={termsStyle}>
        <MyCheckbox onChange={handleSetTerms} isChecked={terms}/>
        <p style={termsTextStyle}>I agree to the Radar’s <a className={'opaque-hoverable'} style={linkStyle} href={'https://radartoolkit.com/privacy-policy'} target={'_blank'}>Privacy Policy</a>.</p>
      </div>
      <MyMapModal isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                  confirmAddress={confirmAddress}
                  address={currentAddress}
                  setAddress={setAddress}
                  goToNextPage={goToNextPage}
      />
      <MyMapModal isOpen={isGenericLocationModalOpen}
                  setIsOpen={setIsGenericLocationModalOpen}
                  confirmAddress={confirmAddress}
                  address={null}
                  isGeneric
                  setAddress={setAddress}
      />
      <SuggestionsModal isOpen={isSuggestionsModalOpen}
                        suggestions={suggestions}
                        goToGenericModal={goToGenericModal}
                        goToRegularMapModal={handleGoToMapModalFromSuggestion}
                        closeModal={closeSuggestionsModal}
      />
    </div>
  )
}

export default LocationSearchStepPage;