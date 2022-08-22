import {DEFAULT_ADDRESS_INPUT_BACKGROUND_COLOR, RED} from "../../../../../utils/colors";
import {DEFAULT_FONT_FAMILY} from "../../../../../utils/fonts";
import {TextField} from "@mui/material";
import locationButtonIcon from '../../../../../assets/location-button.png';
import {useState} from "react";
import MySpinner from "../../../../common/MySpinner";
import LocationSuggestionsList from "./LocationSuggestionsList";
import {debounce} from "../../../../../utils/debouncer";
import {getGeocodedAddress, getSuggestions} from "../../../../../utils/apiRequests";
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

const MyAddressInput = ({ setAddress }) => {

  const [error, setError] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleInputChange = debounce( async (e) => {
    setLocationLoading(true);
    setAddress({name: e.target.value, coordinates: []});
    try {
      const suggestions = await getSuggestions(e.target.value);
      setSuggestions(suggestions);
    } catch (e) {
      setError(e.message);
    }
    setLocationLoading(false);
  });

  const autofillInput = (id, selectedAddress) => {
    const addressInputElement = document.getElementById('address-input');
    const selectedRowText = document.getElementById(`row-${id}-text`);
    addressInputElement.value = selectedRowText.innerText;
    setAddress(selectedAddress);
  }

  return (
    <div>
      <div style={addressInputWrapperStyle}>
        <TextField placeholder={'Enter your address'}
                   id={'address-input'}
                   sx={{width: '90%'}}
                   InputProps={addressInputStyle}
                   error={error}
                   onChange={handleInputChange}
                   variant={'standard'}/>
        <div style={inputAdornmentStyle} onClick={() => setLocationLoading(!locationLoading)}>
          {
            locationLoading ?
              <MySpinner/> :
              <img src={locationButtonIcon}
                   alt={'location-button-icon'}
                   width={32}
                   height={32}
              />
          }
        </div>
      </div>
      { error && <p style={errorMessageStyle}>{error}</p> }
      <LocationSuggestionsList suggestions={suggestions} autofillInput={autofillInput}/>
    </div>
  )
}

export default MyAddressInput;