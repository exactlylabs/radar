import {ReactElement, useState} from "react";
import {styles} from "./styles/SpeedDistributionPercentageBar.style";
import {speedColors} from "../../../utils/speeds";
import PercentageBarIndicatorTooltip from "./PercentageBarIndicatorTooltip";
import {Optional} from "../../../utils/types";

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

  const [tooltipOpen, setTooltipOpen] = useState<Optional<string>>(null);

  const isPercentageWideEnough = (percentage: string): boolean => {
    const value: number = parseFloat(percentage.split('%')[0]);
    return value > 11;
  }

  const hoverUnserved = () => { setTooltipOpen('UNSERVED') };
  const hoverUnderserved = () => { setTooltipOpen('UNDERSERVED') };
  const hoverServed = () => { setTooltipOpen('SERVED') };
  const unhover = () => { setTooltipOpen(null) };

  return (
    <div style={styles.SpeedDistributionPercentageBarWrapper}>
      <div style={styles.SpeedDistributionPercentageBarContainer}>
        <div className={'fw-medium'}
             style={styles.Fragment(unservedPercentage, speedColors.UNSERVED)}
             onMouseOver={hoverUnserved}
             onMouseLeave={unhover}
        >
          { isPercentageWideEnough(unservedPercentage) ? unservedPercentage : ''}
          { 'UNSERVED' === tooltipOpen && <PercentageBarIndicatorTooltip percentage={unservedPercentage}/> }
        </div>
        <div className={'fw-medium'}
             style={styles.Fragment(underservedPercentage, speedColors.UNDERSERVED)}
             onMouseOver={hoverUnderserved}
             onMouseLeave={unhover}
        >
          { isPercentageWideEnough(underservedPercentage) ? underservedPercentage : ''}
          { 'UNDERSERVED' === tooltipOpen && <PercentageBarIndicatorTooltip percentage={underservedPercentage}/> }
        </div>
        <div className={'fw-medium'}
             style={styles.Fragment(servedPercentage, speedColors.SERVED)}
             onMouseOver={hoverServed}
             onMouseLeave={unhover}
        >
          { isPercentageWideEnough(servedPercentage) ? servedPercentage : ''}
          { 'SERVED' === tooltipOpen && <PercentageBarIndicatorTooltip percentage={servedPercentage}/> }
        </div>
      </div>
    </div>
  )
}

export default SpeedDistributionPercentageBar;