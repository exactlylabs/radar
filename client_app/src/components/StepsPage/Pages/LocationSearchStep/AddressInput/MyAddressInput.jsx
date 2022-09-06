import {
  DEFAULT_ADDRESS_INPUT_BACKGROUND_COLOR,
  DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  RED
} from "../../../../../utils/colors";
import {DEFAULT_FONT_FAMILY} from "../../../../../utils/fonts";
import {TextField} from "@mui/material";
import locationButtonIcon from '../../../../../assets/location-button.png';
import LocationButtonSmall from '../../../../../assets/location-icon-small.png';
import {useState} from "react";
import MySpinner from "../../../../common/MySpinner";
import LocationSuggestionsList from "./LocationSuggestionsList";
import {debounce} from "../../../../../utils/debouncer";
import {getAddressForCoordinates, getGeocodedAddress, getSuggestions} from "../../../../../utils/apiRequests";
import {notifyError} from "../../../../../utils/errors";

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
  },
  disableUnderline: true,
}

const inputAdornmentStyle = {
  height: '100%',
  width: 44,
  position: 'absolute',
  right: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const errorMessageStyle = {
  color: RED
}

const locationButtonStyle = {
  cursor: 'pointer',
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

const MyAddressInput = ({ setAddress }) => {

  const [error, setError] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [suggestionsListOpen, setSuggestionsListOpen] = useState(false);

  const handleInputChange = debounce( async (e) => {
    if(!e.target.value) {
      setSuggestionsListOpen(false);
    } else {
      setLocationLoading(true);
      setAddress({address: e.target.value, coordinates: []});
      try {
        const suggestions = await getSuggestions(e.target.value);
        setSuggestions(suggestions);
      } catch (e) {
        notifyError(e);
        setError('Failed to fetch for suggestions. Please try again later.');
      }
      setLocationLoading(false);
    }
  });

  const autofillInput = (id, selectedAddress) => {
    const addressInputElement = document.getElementById('address-input');
    const selectedRowText = document.getElementById(`row-${id}-text`);
    addressInputElement.value = selectedRowText.innerText;
    setAddress(selectedAddress);
  }

  const handleOpenSuggestions = () => {
    const currentInputValue = document.getElementById('address-input').value;
    if(!!currentInputValue) {
      setSuggestionsListOpen(true);
    }
  }

  const fetchAddress = async (coordinates) => {
    const address = await getAddressForCoordinates(coordinates);
    const addressInputElement = document.getElementById('address-input');
    addressInputElement.value = address.address;
    setAddress(address);
  }

  const triggerAutoLocation = () => {
    if ('geolocation' in navigator) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          fetchAddress([pos.coords.latitude, pos.coords.longitude])
            .catch(err => setError(err))
            .finally(() => setLocationLoading(false));
        },
        notifyError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }

  return (
    <div id={'address-input-wrapper'}>
      <div style={addressInputWrapperStyle}>
        <TextField placeholder={'Enter your address or zip code'}
                   id={'address-input'}
                   sx={{width: '90%'}}
                   InputProps={addressInputStyle}
                   error={error}
                   onChange={handleInputChange}
                   onFocus={handleOpenSuggestions}
                   variant={'standard'}/>
        <div style={inputAdornmentStyle} onClick={triggerAutoLocation}>
          {
            locationLoading ?
              <MySpinner/> :
              <img src={locationButtonIcon}
                   style={locationButtonStyle}
                   alt={'location-button-icon'}
                   width={32}
                   height={32}
              />
          }
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
      { error && <p style={errorMessageStyle}>{error}</p> }
      <LocationSuggestionsList suggestions={suggestions}
                               autofillInput={autofillInput}
                               open={suggestionsListOpen}
                               setOpen={setSuggestionsListOpen}
      />
    </div>
  )
}

export default MyAddressInput;