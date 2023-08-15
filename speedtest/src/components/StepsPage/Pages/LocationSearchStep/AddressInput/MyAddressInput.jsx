import {
  DEFAULT_ADDRESS_INPUT_BACKGROUND_COLOR,
  DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR,
  RED, WHITE
} from "../../../../../utils/colors";
import {DEFAULT_FONT_FAMILY} from "../../../../../utils/fonts";
import {TextField} from "@mui/material";
import rightArrowWhite from '../../../../../assets/right-arrow-white.png';
import LocationButtonSmall from '../../../../../assets/location-icon-small.png';
import {useContext, useEffect, useState} from "react";
import MySpinner from "../../../../common/MySpinner";
import LocationSuggestionsList from "./LocationSuggestionsList";
import {debounce} from "../../../../../utils/debouncer";
import {getAddressForCoordinates, getSuggestions} from "../../../../../utils/apiRequests";
import {isNoConnectionError, notifyError} from "../../../../../utils/errors";
import ConnectionContext from "../../../../../context/ConnectionContext";
import './MyAddressInput.css';
import ConfigContext from "../../../../../context/ConfigContext";
import UserDataContext, {emptyAddress} from "../../../../../context/UserData";
import {ADDRESS_PROVIDER} from "../../../../../utils/userMetadata";

const addressInputWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: 16,
  backgroundColor: DEFAULT_ADDRESS_INPUT_BACKGROUND_COLOR,
  margin: '30px auto 15px',
  position: 'relative'
}

const addressInputStyle = {
  style: {
    width: 'calc(100% - 65px)',
    paddingLeft: '20px',
    border: 'none',
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 16,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    color: DEFAULT_TEXT_COLOR
  },
  disableUnderline: true,
}

const inputAdornmentStyle = {
  width: 44,
  height: 44,
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const errorMessageStyle = {
  color: RED,
  marginTop: '15px'
}

const rightArrowStyle = {
  width: 14,
  height: 14,
}

const useCurrentLocationStyle = {
  width: 'max-content',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  margin: 'auto',
}

const smallIconStyle = {
  marginRight: 8,
}

const useLocationStyle = {
  fontSize: 15,
  color: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR
}

const continueButtonStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '10px',
  backgroundColor: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 15px -2px rgba(75, 123, 229, 0.5)'
}

const disabledContinueButtonStyle = {
  ...continueButtonStyle,
  opacity: 0.3
}

const MyAddressInput = ({
  handleContinue,
  setGeolocationError,
  openGenericLocationModal,
  confirmedAddress,
  setSelectedSuggestion,
  selectedSuggestion,
  openSuggestionsModal,
  suggestions,
  setSuggestions
}) => {

  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [suggestionsListOpen, setSuggestionsListOpen] = useState(false);
  const {setNoInternet} = useContext(ConnectionContext);
  const config = useContext(ConfigContext);
  const {userData, setUserData, setAddress} = useContext(UserDataContext);

  useEffect(() => {
    document.getElementById('speedtest--address-input').value = userData.address.address;
  }, [userData.address]);

  const handleInputChange = debounce( async (e) => {
    if(!e.target.value) {
      setSuggestionsListOpen(false);
      setSelectedSuggestion(false);
      setAddress(emptyAddress);
      setSuggestions([]);
    } else {
      setAddress({address: e.target.value, coordinates: []});
      setLocationLoading(true);
      try {
        const suggestions = await getSuggestions(e.target.value, config.clientId);
        setSuggestions(suggestions);
      } catch (e) {
        if(isNoConnectionError(e)) setNoInternet(true);
        notifyError(e);
        setError(e);
      }
      setLocationLoading(false);
    }
  });

  const autofillInput = (id, selectedAddress) => {
    const addressInputElement = document.getElementById('speedtest--address-input');
    const selectedRowText = document.getElementById(`speedtest--row-${id}-text`);
    if(addressInputElement && selectedRowText) {
      addressInputElement.value = selectedRowText.innerText;
      setAddress(selectedAddress);
      setSelectedSuggestion(true);
    }
  }

  const handleOpenSuggestions = () => {
    const wrapperElement = document.getElementById('speedtest--address-input-container');
    const textFieldElement = document.getElementById('speedtest--address-input');
    const continueButtonElement = document.getElementById('speedtest--continue-button');
    if(wrapperElement) wrapperElement.classList.add('speedtest--address-input-container--focused');
    if(textFieldElement) textFieldElement.classList.add('speedtest--address-input--focused');
    if(continueButtonElement) continueButtonElement.classList.add('speedtest--continue-button--focused');
    const currentInputValue = document.getElementById('speedtest--address-input').value;
    if(!!currentInputValue) {
      setSuggestionsListOpen(true);
    }
  }

  const fetchAddress = async (coords) => {
    try {
      const coordinates = [coords.latitude, coords.longitude];
      const address = await getAddressForCoordinates(coordinates, config.clientId);
      if (address.coordinates.length === 0) {
        openGenericLocationModal();
        return;
      }
      setSelectedSuggestion(true);
      setUserData({
        ...userData,
        address,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        speed: coords.speed,
        heading: coords.heading,
        addressProvider: ADDRESS_PROVIDER.BROWSER_GPS,
      });
      handleContinue(address.address, true);
      const addressInputElement = document.getElementById('speedtest--address-input');
      if(addressInputElement) {
        addressInputElement.value = address.address;
      }
    } catch (e) {
      if(isNoConnectionError(e)) setNoInternet(true);
      notifyError(e);
      setError(e);
    }
  }

  const triggerAutoLocation = () => {
    setSelectedSuggestion(false);
    setLocationLoading(true);
    setAddress(emptyAddress);
    setGeolocationError(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchAddress(pos.coords)
            .catch(err => {
              notifyError(err);
              setError(err);
            })
            .finally(() => setLocationLoading(false));
        },
        (err) => {
          console.error(err);
          setGeolocationError(true);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }

  const checkClickConditions = () => {
    if(suggestions?.length === 0 && !confirmedAddress) openGenericLocationModal();
    else if(suggestions && suggestions.length > 0 && !confirmedAddress && !selectedSuggestion) openSuggestionsModal();
    else handleContinue();
  }

  const parseError = (err) => {
    if(typeof err === 'string') return err;
    else return 'There has been an unexpected error. Please try again later.';
  }

  const handleBlurInput = () => {
    const wrapperElement = document.getElementById('speedtest--address-input-container');
    const textFieldElement = document.getElementById('speedtest--address-input');
    const continueButtonElement = document.getElementById('speedtest--continue-button');
    if(wrapperElement && wrapperElement.classList.contains('speedtest--address-input-container--focused')) {
      wrapperElement.classList.remove('speedtest--address-input-container--focused');
      textFieldElement.classList.remove('speedtest--address-input--focused');
      continueButtonElement.classList.remove('speedtest--continue-button--focused');
    }
  }

  return (
    <div id={'speedtest--address-input-wrapper'}>
      <div style={addressInputWrapperStyle} id={'speedtest--address-input-container'}>
        <TextField placeholder={'Enter your address or zip code'}
                   id={'speedtest--address-input'}
                   sx={{width: '100%'}}
                   InputProps={addressInputStyle}
                   error={!!error}
                   onChange={handleInputChange}
                   onFocus={handleOpenSuggestions}
                   onBlur={handleBlurInput}
                   variant={'standard'}
        />
        <div className={!!userData.address?.address ? 'speedtest--opaque-hoverable' : ''}
             style={inputAdornmentStyle}
             id={'speedtest--continue-button'}
             onClick={!!userData.address?.address ? checkClickConditions : undefined}
        >
          <div style={!!userData.address?.address ? continueButtonStyle : disabledContinueButtonStyle}>
            {
              locationLoading ?
                <MySpinner color={WHITE}/> :
                <img src={rightArrowWhite}
                     style={rightArrowStyle}
                     alt={'location-button-icon'}
                     width={32}
                     height={32}
                />
            }
          </div>
        </div>
      </div>
      <div className={'speedtest--opaque-hoverable'}
           style={useCurrentLocationStyle}
           onClick={triggerAutoLocation}
      >
        <img src={LocationButtonSmall}
             width={14}
             height={14}
             alt={'location-button-icon-small'}
             style={smallIconStyle}
         />
        <p className={'speedtest--p speedtest--bold'} style={useLocationStyle}>Use my current location</p>
      </div>
      { error && <p className={'speedtest--p'} style={errorMessageStyle}>{parseError(error)}</p> }
      <LocationSuggestionsList suggestions={suggestions}
                               autofillInput={autofillInput}
                               open={suggestionsListOpen}
                               setOpen={setSuggestionsListOpen}
                               currentInputValue={userData.address.address}
      />
    </div>
  )
}

export default MyAddressInput;