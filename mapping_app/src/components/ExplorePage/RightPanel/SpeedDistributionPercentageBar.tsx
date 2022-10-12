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
  return (
    <div style={styles.SpeedDistributionPercentageBarContainer}>
      <div className={'fw-medium'} style={styles.Fragment(unservedPercentage, speedColors.UNSERVED)}>
        {unservedPercentage}
      </div>
      <div className={'fw-medium'} style={styles.Fragment(underservedPercentage, speedColors.UNDERSERVED)}>
        {underservedPercentage}
      </div>
      <div className={'fw-medium'} style={styles.Fragment(servedPercentage, speedColors.SERVED)}>
        {servedPercentage}
      </div>
    </div>
  )
}

export default SpeedDistributionPercentageBar;