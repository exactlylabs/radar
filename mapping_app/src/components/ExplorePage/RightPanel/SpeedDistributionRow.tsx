import {ReactElement} from "react";
import {speedColors, SpeedsObject, speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import {capitalize} from "../../../utils/strings";
import {styles} from "./styles/SpeedDistributionRow.style";
import {Filter} from "../../../utils/types";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

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

  const {isSmallScreen} = useViewportSizes();

  const getSpeedText = (type: string): string => {
    return speedType === 'Download' ?
      speedTextsDownload[type as keyof SpeedsObject] : speedTextsUpload[type as keyof SpeedsObject];
  }

  const smallContent = () => (
    <>
      <div style={styles.SpeedDistributionRowIcon(speedColors[type as keyof SpeedsObject])}></div>
      <div>
        <p className={'fw-regular'} style={styles.SpeedText}>{getSpeedText(type)}</p>
        <p className={'fw-light'} style={styles.SpeedTag(isSmallScreen)}>{`(${capitalize(type)})`}</p>
      </div>
      <div style={styles.SamplesContainer}>
        <p className={'fw-regular'} style={styles.PeopleCount(isSmallScreen)}>{peopleCount}</p>
        <p className={'fw-light'} style={styles.PeopleCountLabel}>{peopleCount === 1 ? 'sample' : 'samples'}</p>
      </div>
      <p className={'fw-regular'} style={styles.Percentage}>{percentage}</p>
    </>
  )

  const regularContent = () => (
    <>
      <div style={styles.SpeedDistributionRowIcon(speedColors[type as keyof SpeedsObject])}></div>
      <p className={'fw-regular'} style={styles.SpeedText}>{getSpeedText(type)}</p>
      <p className={'fw-light'} style={styles.SpeedTag(isSmallScreen)}>{`(${capitalize(type)})`}</p>
      <p className={'fw-regular'} style={styles.PeopleCount(isSmallScreen)}>{`${peopleCount} ${peopleCount === 1 ? 'sample' : 'samples'}`}</p>
      <p className={'fw-regular'} style={styles.Percentage}>{percentage}</p>
    </>
  )

  return (
    <div style={styles.SpeedDistributionRowContainer(isSmallScreen)}>
      {isSmallScreen ? smallContent() : regularContent()}
    </div>
  )
}

export default SpeedDistributionRow;