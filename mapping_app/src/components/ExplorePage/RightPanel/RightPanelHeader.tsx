import {ReactElement} from "react";
import {styles} from "./styles/RightPanelHeader.style";
import CloseIcon from '../../../assets/close-icon.png';
import {capitalize} from "../../../utils/strings";

interface RightPanelHeaderProps {
  stateName: string;
  stateCountry: string;
  stateSignalState: string;
  closePanel: () => void;
}

const RightPanelHeader = ({
  stateName,
  stateCountry,
  stateSignalState,
  closePanel
}: RightPanelHeaderProps): ReactElement => {
  return (
    <div style={styles.RightPanelHeaderContainer}>
      <div style={styles.LeftSideContainer}>
        <div style={styles.StateTextContainer}>
          <p className={'fw-medium'} style={styles.StateName}>{stateName}</p>
          <p className={'fw-light'} style={styles.StateCountry}>{stateCountry}</p>
        </div>
        <div style={styles.SignalStateContainer}>
          <div style={styles.StateSignalStateIndicator(stateSignalState)}></div>
          <p className={'fw-regular'} style={styles.StateSignalState}>{capitalize(stateSignalState)}</p>
        </div>
      </div>
      <div className={'hover-opaque'} style={styles.CloseButton} onClick={closePanel}>
        <img src={CloseIcon} style={styles.CloseIcon} alt={'close-icon'}/>
      </div>
    </div>
  )
}

export default RightPanelHeader;