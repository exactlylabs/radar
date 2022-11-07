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

  const {isSmallerThanMid} = useViewportSizes();

  const getRegularContent = () => (
    <div style={styles.SpeedDataCellContainer(isSmallerThanMid)}>
      <div style={styles.SpeedDataCellHeader}>
        {icon}
        <p className={'fw-regular'} style={styles.Text(isSmallerThanMid)}>{text}</p>
      </div>
      <div style={styles.ValueContainer}>
        <p className={smallVersion ? 'fw-regular' : 'fw-medium'} style={styles.Value(isSmallerThanMid, smallVersion)}>{value}</p>
        <p className={'fw-regular'} style={styles.Unit(smallVersion)}>{unit}</p>
      </div>
    </div>
  );

  const getSmallContent = () => (
    <div style={styles.SpeedDataCellContainer(isSmallerThanMid)}>
      {icon}
      <p className={'fw-regular'} style={styles.Text(isSmallerThanMid)}>{text}</p>
      <div style={styles.ValueContainer}>
        <p className={smallVersion ? 'fw-regular' : 'fw-medium'} style={styles.Value(isSmallerThanMid, smallVersion)}>{value}</p>
        <p className={'fw-regular'} style={styles.Unit(smallVersion)}>{unit}</p>
      </div>
    </div>
  )

  return isSmallerThanMid ? getSmallContent() : getRegularContent();
}

export default SpeedDataCell;