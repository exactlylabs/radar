import {ReactElement} from "react";
import {styles} from "./styles/PopoverOption.style";
import {ArrowForwardRounded} from "@mui/icons-material";
import MySpinner from "../../common/MySpinner";
import {DEFAULT_GREEN} from "../../../styles/colors";

interface PopoverOptionProps {
  text: string;
  secondaryText?: string;
  light?: boolean;
  onClick: () => void;
  loading: boolean;
}

const PopoverOption = ({
  text,
  secondaryText,
  light,
  onClick,
  loading
}: PopoverOptionProps): ReactElement => {
  return (
    <div className={`hover-popover-option-lighter ${light ? 'popover-light' : 'popover-dark'}`}
         style={styles.PopoverOptionContainer(light)}
         onClick={onClick}
    >
      <p className={'fw-medium'} style={styles.Text}>{text}</p>
      {secondaryText && <p className={'fw-light'} style={styles.SecondaryText}>{secondaryText}</p>}
      {
        loading ?
          <MySpinner color={DEFAULT_GREEN} style={styles.Arrow}/> :
          <ArrowForwardRounded style={styles.Arrow}/>
      }
    </div>
  )
}

export default PopoverOption;