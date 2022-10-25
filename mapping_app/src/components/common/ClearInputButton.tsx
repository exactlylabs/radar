import {ReactElement} from "react";
import {styles} from "./styles/ClearInputButton.style";
import ClearIcon from '../../assets/close-icon.png';

interface ClearInputButtonProps {
  onClick: () => void;
}

const ClearInputButton = ({
  onClick
}: ClearInputButtonProps): ReactElement => {
  return (
    <div className={'hover-opaque'} style={styles.ClearInputButtonContainer} onClick={onClick}>
      <img src={ClearIcon} style={styles.Icon} alt={'clear-icon'}/>
    </div>
  )
}

export default ClearInputButton;