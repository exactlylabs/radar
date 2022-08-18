import {CircularProgress} from "@mui/material";
import {DEFAULT_SPINNER_COLOR} from "../../utils/colors";

const customSpinnerStyle = {
  color: DEFAULT_SPINNER_COLOR,
}

const MySpinner = () => (<CircularProgress size={20} sx={customSpinnerStyle}/>);

export default MySpinner;