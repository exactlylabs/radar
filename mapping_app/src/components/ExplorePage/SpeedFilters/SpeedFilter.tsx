import {ReactElement, useState} from "react";
import {styles} from './styles/SpeedFilter.style';
import CustomCheckbox from "../../common/CustomCheckbox";
import {WHITE} from "../../../styles/colors";

interface SpeedFilterProps {
  boxColor: string;
  text: string;
  secondaryText?: string;
  isChecked: boolean;
  toggleFilter: () => void;
}

const SpeedFilter = ({
  boxColor,
  text,
  secondaryText,
  isChecked,
  toggleFilter
}: SpeedFilterProps): ReactElement => {

  const [checked, setChecked] = useState(isChecked);

  const handleClick = () => {
    setChecked(!checked);
    toggleFilter();
  }

  return (
    <div className={'hover-opaque'} style={styles.SpeedFilterContainer}>
      <CustomCheckbox backgroundColor={boxColor}
                      color={WHITE}
                      isChecked={checked}
                      onClick={handleClick}
      />
      <p className={'fw-regular'} style={styles.Text} onClick={handleClick}>{text}</p>
      { secondaryText && <p className={'fw-light'} style={styles.SecondaryText}>{secondaryText}</p> }
    </div>
  )
}

export default SpeedFilter;