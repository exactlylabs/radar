import {ReactElement} from "react";
import {styles} from "./styles/CustomCheckbox.style";

const WhiteTick = '/assets/images/white-tick.png';

interface CustomCheckboxProps {
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
}

const CustomCheckbox = ({
  isChecked,
  setIsChecked
}: CustomCheckboxProps): ReactElement => {

  const handleClick = () => setIsChecked(!isChecked);

  return (
    <div style={styles.Checkbox(isChecked)}
         onClick={handleClick}
    >
      {isChecked && <img src={WhiteTick} alt={'check icon'} style={styles.CheckboxIcon} />}
    </div>
  )
}

export default CustomCheckbox;