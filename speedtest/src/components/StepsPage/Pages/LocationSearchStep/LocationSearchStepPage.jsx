import {useContext, useState} from "react";
import {MyTitle} from "../../../common/MyTitle";
import MyAddressInput from "./AddressInput/MyAddressInput";
import MyMessageSnackbar from "../../../common/MyMessageSnackbar";
import MyMapModal from "./MyMapModal";
import {DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import SuggestionsModal from "./SuggestionsModal";
import {MyBackButton} from "../../../common/MyBackButton";
import iconLeftArrow from '../../../../assets/icons-left-arrow.png';
import {useViewportSizes} from "../../../../hooks/useViewportSizes";
import {emptyAddress} from "../../../../context/UserData";

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
}

const LocationSearchStepPage = ({
  confirmAddress,
  error,
  setAddress,
  isModalOpen,
  setIsModalOpen,
  handleContinue,
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

  const onConfirmAddress = (coordinates) => {
    if(coordinates) {
      confirmAddress(coordinates);
    } else {
      const addressInputElement = document.getElementById('speedtest--address-input');
      if (addressInputElement) {
        addressInputElement.value = null;
        setAddress(emptyAddress);
      }
    }
  }

  const closeSuggestionsModal = () => setIsSuggestionsModalOpen(false);

  return (
    <div style={locationSearchStepStyle}>
      <MyTitle text={'What is your location?'}/>
      <div style={subtitleStyle}>Your location is used to compare your results to others in your region.</div>
      <MyAddressInput handleContinue={handleContinue}
                      setGeolocationError={setGeolocationError}
                      openGenericLocationModal={openGenericLocationModal}
                      openCurrentLocationModal={setIsModalOpen}
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
                  confirmAddress={onConfirmAddress}
                  setAddress={setAddress}
                  goToNextPage={goToNextPage}
      />
      <MyMapModal isOpen={isGenericLocationModalOpen}
                  setIsOpen={setIsGenericLocationModalOpen}
                  confirmAddress={onConfirmAddress}
                  address={null}
                  isGeneric
                  setAddress={setAddress}
                  goToNextPage={goToNextPage}
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