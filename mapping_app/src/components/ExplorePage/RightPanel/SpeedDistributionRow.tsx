import {ReactElement} from "react";
import {speedColors, SpeedsObject, speedTexts} from "../../../utils/speeds";
import {capitalize} from "../../../utils/strings";
import {styles} from "./styles/SpeedDistributionRow.style";

interface SpeedDistributionRowProps {
  type: string;
  peopleCount: number;
  percentage: string;
}

const SpeedDistributionRow = ({
  type,
  peopleCount,
  percentage
}: SpeedDistributionRowProps): ReactElement => {
  return (
    <div style={styles.SpeedDistributionRowContainer()}>
      <div style={styles.SpeedDistributionRowIcon(speedColors[type as keyof SpeedsObject])}></div>
      <p className={'fw-regular'} style={styles.SpeedText()}>{speedTexts[type as keyof SpeedsObject]}</p>
      <p className={'fw-light'} style={styles.SpeedTag()}>{`(${capitalize(type)})`}</p>
      <p className={'fw-regular'} style={styles.PeopleCount()}>{`${peopleCount} people`}</p>
      <p className={'fw-regular'} style={styles.Percentage()}>{percentage}</p>
    </div>
  )
}

export default SpeedDistributionRow;