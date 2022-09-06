import {useState} from "react";
import {
  DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  TRANSPARENT, WHITE
} from "../../utils/colors";
import {Check} from "@mui/icons-material";

const myCheckboxStyle = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: `solid 1px rgba(17, 14, 76, 0.3)`,
  backgroundColor: TRANSPARENT,
  marginRight: 10,
  cursor: 'pointer',
}

const checkedInsideStyle = {
  width: '99%',
  height: '99%',
  borderRadius: 5,
  backgroundColor: DEFAULT_BLUE_BUTTON_BACKGROUND_COLOR,
  border: 'none',
  margin: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const MyCheckbox = ({onChange}) => {

  const [selected, setSelected] = useState(false);

  const handleOnChange = () => {
    onChange(!selected);
    setSelected(!selected);
  }

  return (
    <div style={myCheckboxStyle} onClick={handleOnChange}>
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