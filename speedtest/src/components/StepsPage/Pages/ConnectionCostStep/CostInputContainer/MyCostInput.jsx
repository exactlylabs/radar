import {
  DEFAULT_COST_INPUT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  TRANSPARENT
} from "../../../../../utils/colors";
import {TextField} from "@mui/material";
import {DEFAULT_FONT_FAMILY} from "../../../../../utils/fonts";
import './MyCostInput.css';
import {useState} from "react";

const costInputWrapperStyle = {
  borderRadius: 16,
  backgroundColor: DEFAULT_COST_INPUT_BACKGROUND_COLOR,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginRight: 15,
  marginLeft: 15,
}

const inputStyle = {
  style: {
    width: '100%',
    paddingLeft: '20px',
    border: 'none',
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 16,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    backgroundColor: TRANSPARENT,
    color: DEFAULT_TEXT_COLOR
  },
  disableUnderline: true,
  inputMode: 'numeric',
  pattern: '[0-9]*',
}

const focusInputStyle = {
  ...inputStyle,
  style: {
    ...inputStyle.style,
    paddingLeft: '18px'
  },
}

const currencyStyle = {
  fontSize: 15,
  color: DEFAULT_TEXT_COLOR
}

const MyCostInput = ({
  value,
  handleChange,
}) => {

  const [focus, setFocus] = useState(false);

  const handleFocus = () => {
    setFocus(true);
    const containerElement = document.getElementById('cost-input-container');
    const currencyElement = document.getElementById('my-cost-input-currency');
    if(containerElement && currencyElement) {
      containerElement.classList.add('cost-input-container--focused');
      currencyElement.classList.add('my-cost-input-currency--focused');
    }
  }

  const handleBlur = () => {
    setFocus(false);
    const containerElement = document.getElementById('cost-input-container');
    const currencyElement = document.getElementById('my-cost-input-currency');
    if(containerElement && containerElement.classList.contains('cost-input-container--focused')) {
      containerElement.classList.remove('cost-input-container--focused');
    }

    if(currencyElement && currencyElement.classList.contains('my-cost-input-currency--focused')) {
      currencyElement.classList.remove('my-cost-input-currency--focused');
    }
  }

  return (
    <div style={costInputWrapperStyle} id={'cost-input-container'}>
      <TextField variant={'standard'}
                 sx={{width: '60%'}}
                 InputProps={focus ? focusInputStyle : inputStyle}
                 placeholder={'0'}
                 value={value}
                 onChange={handleChange}
                 onFocus={handleFocus}
                 onBlur={handleBlur}
      />
      <div id={'my-cost-input-currency'} style={currencyStyle}>US $</div>
    </div>
  )
}

export default MyCostInput;