import {ReactElement} from "react";
import {styles} from "./styles/SpeedDataCell.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface SpeedDataCellProps {
  icon: ReactElement;
  text: string;
  value: string;
  unit: string;
  smallVersion?: boolean;
  horizontalVersion?: boolean;
}

const SpeedDataCell = ({
  icon,
  text,
  value,
  unit,
  smallVersion,
  horizontalVersion
}: SpeedDataCellProps): ReactElement => {

  const {isSmallScreen, isTabletScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isTabletScreen;

  const getRegularContent = () => (
    <div style={styles.SpeedDataCellContainer(isSmall)}>
      <div style={styles.SpeedDataCellHeader}>
        {icon}
        <p className={'fw-regular'} style={styles.Text(isSmall)}>{text}</p>
      </div>
      <div style={styles.ValueContainer}>
        <p className={smallVersion ? 'fw-regular' : 'fw-medium'} style={styles.Value(isSmall, smallVersion)}>{value}</p>
        <p className={'fw-regular'} style={styles.Unit(smallVersion)}>{unit}</p>
      </div>
    </div>
  );

  const getSmallContent = () => (
    <div style={styles.SpeedDataCellContainer(isSmall)}>
      {icon}
      <p className={'fw-regular'} style={styles.Text(isSmall)}>{text}</p>
      <div style={styles.ValueContainer}>
        <p className={smallVersion ? 'fw-regular' : 'fw-medium'} style={styles.Value(isSmall, smallVersion)}>{value}</p>
        <p className={'fw-regular'} style={styles.Unit(smallVersion)}>{unit}</p>
      </div>
    </div>
  );

  const getHorizontalContent = () => (
    <div style={styles.SpeedDataCellContainer(isSmall, horizontalVersion)}>
      <div>
        {icon}
      </div>
      <div>
        <p className={'fw-regular'} style={styles.Text(false, horizontalVersion)}>{text}</p>
        <div style={styles.ValueContainer}>
          <p className={'fw-medium'} style={styles.Value(isSmall, smallVersion, horizontalVersion)}>{value}</p>
          <p className={'fw-medium'} style={styles.Unit(smallVersion, horizontalVersion)}>{unit}</p>
        </div>
      </div>
    </div>
  );

  return horizontalVersion ? getHorizontalContent() :
         isSmall ? getSmallContent() :
         getRegularContent();
}

export default SpeedDataCell;