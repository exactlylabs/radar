import {ReactElement} from "react";
import {styles} from "./styles/MyCheckbox.style";
import {CheckRounded} from "@mui/icons-material";

interface MyCheckboxProps {
  backgroundColor: string;
  color: string;
  isChecked: boolean;
  onClick: () => void;
}

const MyCheckbox = ({
  backgroundColor,
  color,
  isChecked,
  onClick,
}: MyCheckboxProps): ReactElement => {
  return (
    <div style={styles.MyCheckboxContainer(backgroundColor, color)}
         onClick={onClick}
    >
      {isChecked && <CheckRounded style={styles.Icon()}/>}
    </div>
  )
}

export default MyCheckbox;