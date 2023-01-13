import {CircularProgress} from "@mui/material";
import {DEFAULT_SPINNER_COLOR} from "../../utils/colors";

const customSpinnerStyle = (color = DEFAULT_SPINNER_COLOR) => ({ color });

const MySpinner = ({ color }) => (<CircularProgress size={20} sx={customSpinnerStyle(color)}/>);

export default MySpinner;