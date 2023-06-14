import {ReactElement} from "react";
import {styles} from "../styles/SpeedDistributionRow.style";
import {speedColors, SpeedsObject} from "../../../../utils/speeds";
import {capitalize} from "../../../../utils/strings";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

interface RegularSpeedDistributionRowProps {
  speedText: string;
  type: string;
  peopleCount: number;
  percentage: string;
}

const RegularSpeedDistributionRow = ({
  speedText,
  type,
  peopleCount,
  percentage,
}: RegularSpeedDistributionRowProps): ReactElement => {

  const {isSmallScreen} = useViewportSizes();

  return (
    <>
      <div style={styles.SpeedDistributionRowIcon(speedColors[type as keyof SpeedsObject])}></div>
      <p className={'fw-regular'} style={styles.SpeedText}>{speedText}</p>
      <p className={'fw-light'} style={styles.SpeedTag(isSmallScreen)}>{`(${capitalize(type)})`}</p>
      <p className={'fw-regular'} style={styles.PeopleCount(isSmallScreen)}>{`${peopleCount} ${peopleCount === 1 ? 'sample' : 'samples'}`}</p>
      <p className={'fw-regular'} style={styles.Percentage}>{percentage}</p>
    </>
  )
}

export default RegularSpeedDistributionRow;