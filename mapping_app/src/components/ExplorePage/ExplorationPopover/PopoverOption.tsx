import {ReactElement} from "react";
import {styles} from "./styles/PopoverOption.style";
import {ArrowForwardRounded} from "@mui/icons-material";

interface PopoverOptionProps {
  text: string;
  secondaryText?: string;
  light?: boolean;
  onClick: () => void;
}

const PopoverOption = ({text, secondaryText, light, onClick}: PopoverOptionProps): ReactElement => {
  return (
    <div className={`hover-popover-option-lighter ${light ? 'popover-light' : 'popover-dark'}`}
         style={styles.PopoverOptionContainer(light)}
         onClick={onClick}
    >
      <p className={'fw-medium'} style={styles.Text()}>{text}</p>
      {secondaryText && <p className={'fw-light'} style={styles.SecondaryText()}>{secondaryText}</p>}
      <ArrowForwardRounded style={styles.Arrow()}/>
    </div>
  )
}

export default PopoverOption;