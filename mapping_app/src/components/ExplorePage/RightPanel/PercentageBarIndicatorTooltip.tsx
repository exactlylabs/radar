import {ReactElement} from "react";
import {styles} from "./styles/PercentageBarIndicatorTooltip.style";

interface PercentageBarIndicatorTooltipProps {
  percentage: string;
}

const PercentageBarIndicatorTooltip = ({
  percentage
}: PercentageBarIndicatorTooltipProps): ReactElement => {
  return (
    <div style={styles.PercentageBarIndicatorTooltipContainer}>
      <p className={'fw-medium'} style={styles.Text}>{percentage}</p>
      <div style={styles.DownArrow}></div>
    </div>
  )
}

export default PercentageBarIndicatorTooltip;