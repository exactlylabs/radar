import {ReactElement} from "react";
import {speedColors, SpeedsObject, speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import {capitalize} from "../../../utils/strings";
import {styles} from "./styles/SpeedDistributionRow.style";
import {Filter} from "../../../utils/types";

interface SpeedDistributionRowProps {
  type: string;
  peopleCount: number;
  percentage: string;
  speedType: Filter;
}

const SpeedDistributionRow = ({
  type,
  peopleCount,
  percentage,
  speedType
}: SpeedDistributionRowProps): ReactElement => {

  const getSpeedText = (type: string): string => {
    return speedType === 'Download' ?
      speedTextsDownload[type as keyof SpeedsObject] : speedTextsUpload[type as keyof SpeedsObject];
  }

  return (
    <div style={styles.SpeedDistributionRowContainer}>
      <div style={styles.SpeedDistributionRowIcon(speedColors[type as keyof SpeedsObject])}></div>
      <p className={'fw-regular'} style={styles.SpeedText}>{getSpeedText(type)}</p>
      <p className={'fw-light'} style={styles.SpeedTag}>{`(${capitalize(type)})`}</p>
      <p className={'fw-regular'} style={styles.PeopleCount}>{`${peopleCount} people`}</p>
      <p className={'fw-regular'} style={styles.Percentage}>{percentage}</p>
    </div>
  )
}

export default SpeedDistributionRow;