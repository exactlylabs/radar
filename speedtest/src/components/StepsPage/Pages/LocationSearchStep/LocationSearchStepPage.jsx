import {useState} from "react";
import {MyTitle} from "../../../common/MyTitle";
import MyAddressInput from "./AddressInput/MyAddressInput";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import MyMapModal from "./MyMapModal";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import SuggestionsModal from "./SuggestionsModal";
import {MyBackButton} from "../../../common/MyBackButton";
import iconLeftArrow from '../../../../assets/icons-left-arrow.png';
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

const locationSearchStepStyle = {
  width: '100%',
  margin: '0 auto',
  position: 'relative',
}

const subtitleStyle = {
  color: DEFAULT_TEXT_COLOR
}

const backButtonContainer = {
  width: 'max-content',
  margin: '40px auto 0'
}

const smallBackButtonContainer = {
  width: 'max-content',
  margin: '30px auto 55px'
}

const arrowIconStyle = {
  width: '14px',
  height: '14px',
  marginRight: '15px',
  marginLeft: '-4px'
}

const LocationSearchStepPage = ({
  confirmAddress,
  error,
  setAddress,
  isModalOpen,
  setIsModalOpen,
  handleContinue,
  currentAddress,
  setGeolocationError,
  confirmedAddress,
  setSelectedSuggestion,
  selectedSuggestion,
  goToNextPage,
  goBack
}) => {

  const [isGenericLocationModalOpen, setIsGenericLocationModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const isSmall = isSmallSizeScreen || isMediumSizeScreen;

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
      <div style={isSmall ? smallBackButtonContainer : backButtonContainer}>
        <MyBackButton onClick={goBack} icon={<img src={iconLeftArrow} alt={'go back arrow icon'} style={arrowIconStyle}/> } text={'Go back'} iconFirst />
      </div>
    </div>
  )
}

export default LocationSearchStepPage;