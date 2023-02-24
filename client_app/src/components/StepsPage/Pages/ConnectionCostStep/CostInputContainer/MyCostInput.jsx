import {
  DEFAULT_COST_INPUT_BACKGROUND_COLOR,
  DEFAULT_COST_INPUT_BORDER_COLOR, DEFAULT_TEXT_COLOR,
  TRANSPARENT
} from "../../../../../utils/colors";
import {TextField} from "@mui/material";
import {DEFAULT_FONT_FAMILY} from "../../../../../utils/fonts";

const costInputWrapperStyle = {
  width: 140,
  height: 56,
  border: `solid 1px ${DEFAULT_COST_INPUT_BORDER_COLOR}`,
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

const currencyStyle = {
  fontSize: 15,
  marginRight: 15,
  color: DEFAULT_TEXT_COLOR
}

const MyCostInput = ({
  value,
  handleChange,
}) => {

  return (
    <div style={costInputWrapperStyle}>
      <TextField variant={'standard'}
                 sx={{width: '60%'}}
                 InputProps={inputStyle}
                 placeholder={'0'}
                 value={value}
                 onChange={handleChange}
      />
      <div style={currencyStyle}>US $</div>
    </div>
  )
}

export default MyCostInput;