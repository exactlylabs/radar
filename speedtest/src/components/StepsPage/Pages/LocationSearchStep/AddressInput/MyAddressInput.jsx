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
import {emptyAddress} from "../../../StepsPage";
import ConnectionContext from "../../../../../context/ConnectionContext";

const addressInputWrapperStyle = {
  width: '80%',
  maxWidth: 400,
  height: 56,
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  borderRadius: 16,
  backgroundColor: DEFAULT_ADDRESS_INPUT_BACKGROUND_COLOR,
  margin: '30px auto 10px',
  position: 'relative'
}

const addressInputStyle = {
  style: {
    width: '90%',
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
  right: 10,
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
  setAddress,
  handleContinue,
  currentAddress,
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

  useEffect(() => {
    document.getElementById('address-input').value = currentAddress.address;
  }, [currentAddress]);

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
        const suggestions = await getSuggestions(e.target.value);
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
    const addressInputElement = document.getElementById('address-input');
    const selectedRowText = document.getElementById(`row-${id}-text`);
    if(addressInputElement && selectedRowText) {
      addressInputElement.value = selectedRowText.innerText;
      setAddress(selectedAddress);
      setSelectedSuggestion(true);
    }
  }

  const handleOpenSuggestions = () => {
    const currentInputValue = document.getElementById('address-input').value;
    if(!!currentInputValue) {
      setSuggestionsListOpen(true);
    }
  }

  const fetchAddress = async (coordinates) => {
    try {
      const address = await getAddressForCoordinates(coordinates);
      if (address.coordinates.length === 0) {
        openGenericLocationModal();
        return;
      }
      setSelectedSuggestion(true);
      setAddress(address);
      handleContinue(address.address, true);
      const addressInputElement = document.getElementById('address-input');
      addressInputElement.value = address.address;
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
          fetchAddress([pos.coords.latitude, pos.coords.longitude])
            .catch(err => {
              notifyError(err);
              setError(err);
            })
            .finally(() => setLocationLoading(false));
        },
        (err) => {
          setGeolocationError(true);
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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

  return (
    <div id={'address-input-wrapper'}>
      <div style={addressInputWrapperStyle}>
        <TextField placeholder={'Enter your address or zip code'}
                   id={'address-input'}
                   sx={{width: '90%'}}
                   InputProps={addressInputStyle}
                   error={!!error}
                   onChange={handleInputChange}
                   onFocus={handleOpenSuggestions}
                   variant={'standard'}
        />
        <div className={!!currentAddress?.address ? 'opaque-hoverable' : ''}
             style={inputAdornmentStyle}
             onClick={!!currentAddress?.address ? checkClickConditions : undefined}
        >
          <div style={!!currentAddress?.address ? continueButtonStyle : disabledContinueButtonStyle}>
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
      <div className={'opaque-hoverable'}
           style={useCurrentLocationStyle}
           onClick={triggerAutoLocation}
      >
        <img src={LocationButtonSmall}
             width={12}
             height={12}
             alt={'location-button-icon-small'}
             style={smallIconStyle}
         />
        <p className={'bold'} style={useLocationStyle}>Use my current location.</p>
      </div>
      { error && <p style={errorMessageStyle}>{parseError(error)}</p> }
      <LocationSuggestionsList suggestions={suggestions}
                               autofillInput={autofillInput}
                               open={suggestionsListOpen}
                               setOpen={setSuggestionsListOpen}
                               currentInputValue={currentAddress.address}
      />
    </div>
  )
}

export default MyAddressInput;