import {ReactElement} from "react";
import {styles} from "./styles/CustomCheckbox.style";
import {CheckRounded} from "@mui/icons-material";

interface CustomCheckboxProps {
  backgroundColor: string;
  color: string;
  isChecked: boolean;
  onClick: () => void;
}

const CustomCheckbox = ({
  backgroundColor,
  color,
  isChecked,
  onClick,
}: CustomCheckboxProps): ReactElement => {
  return (
    <div style={styles.MyCheckboxContainer(backgroundColor, color)}
         onClick={onClick}
    >
      {isChecked && <CheckRounded style={styles.Icon}/>}
    </div>
  )
}

export default CustomCheckbox;