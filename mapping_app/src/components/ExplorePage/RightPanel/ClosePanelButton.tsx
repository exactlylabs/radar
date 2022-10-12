import {ReactElement} from "react";
import {styles} from "./styles/ClosePanelButton.style";
import {ArrowForwardRounded} from "@mui/icons-material";

interface ClosePanelProps {
  onClick: () => void;
}

const ClosePanelButton = ({
  onClick
}: ClosePanelProps): ReactElement => {
  return (
    <div className={'hover-opaque'}
         style={styles.ClosePanelButtonContainer}
         onClick={onClick}
    >
      <ArrowForwardRounded style={styles.Arrow}/>
    </div>
  )
}

export default ClosePanelButton;