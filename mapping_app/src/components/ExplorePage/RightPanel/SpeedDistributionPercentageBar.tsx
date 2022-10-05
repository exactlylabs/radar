import {ReactElement} from "react";
import {styles} from "./styles/SpeedDistributionPercentageBar.style";
import {speedColors} from "../../../utils/speeds";

interface SpeedDistributionPercentageBarProps {
  unservedPercentage: string;
  underservedPercentage: string;
  servedPercentage: string;
}

const SpeedDistributionPercentageBar = ({
  unservedPercentage,
  underservedPercentage,
  servedPercentage
}: SpeedDistributionPercentageBarProps): ReactElement => {

  const isPercentageWideEnough = (percentage: string): boolean => {
    const value: number = parseFloat(percentage.split('%')[0]);
    return value > 11;
  }

  return (
    <div style={styles.SpeedDistributionPercentageBarContainer}>
      <div className={'fw-medium'} style={styles.Fragment(unservedPercentage, speedColors.UNSERVED)}>
        { isPercentageWideEnough(unservedPercentage) ? unservedPercentage : ''}
      </div>
      <div className={'fw-medium'} style={styles.Fragment(underservedPercentage, speedColors.UNDERSERVED)}>
        { isPercentageWideEnough(underservedPercentage) ? underservedPercentage : ''}
      </div>
      <div className={'fw-medium'} style={styles.Fragment(servedPercentage, speedColors.SERVED)}>
        { isPercentageWideEnough(servedPercentage) ? servedPercentage : ''}
      </div>
    </div>
  )
}

export default SpeedDistributionPercentageBar;