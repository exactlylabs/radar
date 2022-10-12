import {ReactElement} from "react";
import {styles} from './styles/SpeedFilter.style';
import MyCheckbox from "../../common/MyCheckbox";
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
  return (
    <div style={styles.SpeedFilterContainer}>
      <MyCheckbox backgroundColor={boxColor}
                  color={WHITE}
                  isChecked={isChecked}
                  onClick={toggleFilter}
      />
      <p className={'fw-regular'} style={styles.Text}>{text}</p>
      { secondaryText && <p className={'fw-light'} style={styles.SecondaryText}>{secondaryText}</p> }
    </div>
  )
}

export default SpeedFilter;