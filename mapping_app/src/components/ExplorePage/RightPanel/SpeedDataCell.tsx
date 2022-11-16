import {ReactElement} from "react";
import {styles} from "./styles/SpeedDataCell.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface SpeedDataCellProps {
  icon: ReactElement;
  text: string;
  value: string;
  unit: string;
  smallVersion?: boolean;
}

const SpeedDataCell = ({
  icon,
  text,
  value,
  unit,
  smallVersion
}: SpeedDataCellProps): ReactElement => {

  const {isSmallScreen, isSmallTabletScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isSmallTabletScreen;

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
  )

  return isSmall ? getSmallContent() : getRegularContent();
}

export default SpeedDataCell;