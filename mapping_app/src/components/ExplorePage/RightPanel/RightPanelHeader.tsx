import {ReactElement} from "react";
import {styles} from "./styles/RightPanelHeader.style";
import CloseIcon from '../../../assets/close-icon.png';
import {capitalize} from "../../../utils/strings";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface RightPanelHeaderProps {
  geospaceName: string;
  country: string;
  parentName?: string;
  stateSignalState: string;
  closePanel?: () => void;
}

const RightPanelHeader = ({
  geospaceName,
  parentName,
  country,
  stateSignalState,
  closePanel
}: RightPanelHeaderProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isSmallTabletScreen;

  const getRegularContent = () => (
    <div style={styles.StateTextContainer(false)}>
      <p className={'fw-medium'} style={styles.GeospaceName(isSmall)}>{geospaceName}</p>
      <p className={'fw-light'} style={styles.StateCountry(isSmall)}>{country}</p>
    </div>
  );

  const getTwoLineContent = () => (
    <div style={styles.StateTextContainer(true)}>
      <p className={'fw-medium'} style={styles.GeospaceName(isSmall)}>{geospaceName}</p>
      <div className={'fw-light'} style={styles.StateAndCountryLine}>
        <p className={'fw-light'} style={styles.ParentName(isSmall)}>{`${parentName}, `}</p>
        <p className={'fw-light'} style={styles.StateCountry(isSmall)}>{country}</p>
      </div>
    </div>
  )

  const getTextContent = () => {
    return !!parentName ? getTwoLineContent() : getRegularContent();
  }

  return (
    <div style={styles.RightPanelHeaderContainer(!!parentName, isSmall)}>
      <div style={styles.LeftSideContainer(isSmall)}>
        {getTextContent()}
        <div style={styles.SignalStateContainer}>
          <div style={styles.StateSignalStateIndicator(stateSignalState)}></div>
          <p className={'fw-regular'} style={styles.StateSignalState}>{capitalize(stateSignalState)}</p>
        </div>
      </div>
      { !!closePanel &&
        <div className={'hover-opaque'} style={styles.CloseButton} onClick={closePanel}>
          <img src={CloseIcon} style={styles.CloseIcon} alt={'close-icon'}/>
        </div>
      }
    </div>
  )
}

export default RightPanelHeader;