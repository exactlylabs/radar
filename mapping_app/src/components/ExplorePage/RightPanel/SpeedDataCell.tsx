import {ReactElement} from "react";
import {styles} from "./styles/SpeedDataCell.style";

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
  return (
    <div style={styles.SpeedDataCellContainer}>
      <div style={styles.SpeedDataCellHeader}>
        {icon}
        <p className={'fw-regular'} style={styles.Text}>{text}</p>
      </div>
      <div style={styles.ValueContainer}>
        <p className={smallVersion ? 'fw-regular' : 'fw-medium'} style={styles.Value(smallVersion)}>{value}</p>
        <p className={'fw-regular'} style={styles.Unit(smallVersion)}>{unit}</p>
      </div>
    </div>
  )
}

export default SpeedDataCell;