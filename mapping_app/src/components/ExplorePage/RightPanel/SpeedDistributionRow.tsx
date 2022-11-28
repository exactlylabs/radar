import {ReactElement} from "react";
import {SpeedsObject, speedTextsDownload, speedTextsUpload} from "../../../utils/speeds";
import {styles} from "./styles/SpeedDistributionRow.style";
import {Filter} from "../../../utils/types";
import {SpeedFilters} from "../../../utils/filters";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import RegularSpeedDistributionRow from "./SpeedDistributionRows/RegularSpeedDistributionRow";
import SmallSpeedDistributionRow from "./SpeedDistributionRows/SmallSpeedDistributionRow";

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

  const {isSmallerThanMid} = useViewportSizes();

  const getSpeedText = (type: string): string => {
    return speedType === SpeedFilters.DOWNLOAD ?
      speedTextsDownload[type as keyof SpeedsObject] : speedTextsUpload[type as keyof SpeedsObject];
  }

  return (
    <div style={styles.SpeedDistributionRowContainer(isSmallerThanMid)}>
      {
        isSmallerThanMid ?
        <SmallSpeedDistributionRow speedText={getSpeedText(type)}
                                   type={type}
                                   peopleCount={peopleCount}
                                   percentage={percentage}
        /> :
        <RegularSpeedDistributionRow speedText={getSpeedText(type)}
                                     type={type}
                                     peopleCount={peopleCount}
                                     percentage={percentage}
        />
      }
    </div>
  )
}

export default SpeedDistributionRow;