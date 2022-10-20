import {ReactElement} from "react";
import {styles} from "./styles/ApplyDateRangeButton.style";


const ApplyDateRangeButton = (): ReactElement => {
  return (
    <button style={styles.ApplyDateRangeButton}
            className={'fw-medium hover-opaque'}
    >
      Apply date range
    </button>
  )
}

export default ApplyDateRangeButton;