import {styles} from "../styles/SpeedDistributionRow.style";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";
import {capitalize} from "../../../../utils/strings";
import {ReactElement} from "react";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

interface SmallSpeedDistributionRowProps {
  speedText: string;
  type: string;
  peopleCount: number;
  percentage: string;
}

const SmallSpeedDistributionRow = ({
  speedText,
  type,
  peopleCount,
  percentage
}: SmallSpeedDistributionRowProps): ReactElement => {

  const {isSmallerThanMid} = useViewportSizes();

  return (
    <>
      <div style={styles.SpeedDistributionRowIcon(speedColors[type as keyof SpeedsObject])}></div>
      <div>
        <p className={'fw-regular'} style={styles.SpeedText}>{speedText}</p>
        <p className={'fw-light'} style={styles.SpeedTag(isSmallerThanMid)}>{`(${capitalize(type)})`}</p>
      </div>
      <div style={styles.SamplesContainer}>
        <p className={'fw-regular'} style={styles.PeopleCount(isSmallerThanMid)}>{peopleCount}</p>
        <p className={'fw-light'} style={styles.PeopleCountLabel}>{peopleCount === 1 ? 'sample' : 'samples'}</p>
      </div>
      <p className={'fw-regular'} style={styles.Percentage}>{percentage}</p>
    </>
  )
}

export default SmallSpeedDistributionRow;