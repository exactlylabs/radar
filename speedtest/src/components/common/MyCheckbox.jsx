import {useEffect, useState} from "react";
import {
  DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  TRANSPARENT, WHITE
} from "../../utils/colors";
import {Check} from "@mui/icons-material";

const myCheckboxStyle = {
  width: 20,
  height: 20,
  minWidth: 20,
  minHeight: 20,
  borderRadius: 6,
  border: `solid 1px rgba(17, 14, 76, 0.3)`,
  backgroundColor: TRANSPARENT,
  marginRight: 10,
  cursor: 'pointer',
}

const myCheckedCheckboxStyle = {
  ...myCheckboxStyle,
  border: 'none',
  height: 22,
  width: 22,
}

const checkedInsideStyle = {
  width: '100%',
  height: '100%',
  borderRadius: 5,
  backgroundColor: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  border: 'none',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const MyCheckbox = ({onChange, isChecked}) => {

  const [selected, setSelected] = useState(isChecked);

  useEffect(() => {
    setSelected(isChecked);
  }, [isChecked]);

  const handleOnChange = () => {
    onChange(!selected);
    setSelected(!selected);
  }

  return (
    <div style={isChecked ? myCheckedCheckboxStyle : myCheckboxStyle} onClick={handleOnChange}>
      {
        selected &&
        <div style={checkedInsideStyle}>
          <Check sx={{color: WHITE, fontSize: '16px'}}/>
        </div>
      }
    </div>
  )
};

export default MyCheckbox;