import {ReactElement} from "react";
import {styles} from "./styles/ClosePanelButton.style";
import {ArrowBackRounded, ArrowForwardRounded} from "@mui/icons-material";
import { motion } from "framer-motion";

interface ClosePanelProps {
  onClick: () => void;
  isHidden: boolean;
}

const HidePanelButton = ({
  onClick,
  isHidden
}: ClosePanelProps): ReactElement => {
  return (
    <div className={'hover-opaque'}
         style={styles.ClosePanelButtonContainer(isHidden)}
         onClick={onClick}
    >
      {!isHidden ?
        <ArrowForwardRounded style={styles.Arrow}/> :
        <ArrowBackRounded style={styles.Arrow}/>
      }
    </div>
  )
}

export default HidePanelButton;