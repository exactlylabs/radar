import {ReactElement} from "react";
import {speedColors, SpeedsObject, speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import {styles} from "./styles/SpeedDistributionRow.style";
import {Filter} from "../../../utils/types";
import {SpeedFilters} from "../../../utils/filters";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {capitalize} from "../../../utils/strings";
import SmallSpeedDistributionRow from "./SpeedDistributionRows/SmallSpeedDistributionRow";
import RegularSpeedDistributionRow from "./SpeedDistributionRows/RegularSpeedDistributionRow";

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
    return speedType === SpeedFilters.DOWNLOAD ?
      speedTextsDownload[type as keyof SpeedsObject] : speedTextsUpload[type as keyof SpeedsObject];
  }

  return (
    <div style={styles.SpeedDistributionRowContainer(isSmallScreen)}>
      {isSmallScreen ?
        <SmallSpeedDistributionRow speedText={getSpeedText(type)} type={type} peopleCount={peopleCount} percentage={percentage}/> :
        <RegularSpeedDistributionRow speedText={getSpeedText(type)} type={type} peopleCount={peopleCount} percentage={percentage}/>
      }
    </div>
  )
}

export default SpeedDistributionRow;