import {CSSProperties, ReactElement} from "react";
import { SpinnerCircular } from "spinners-react";

interface MySpinnerProps {
  color: string;
  style: CSSProperties;
}

const MySpinner = ({color, style}: MySpinnerProps): ReactElement => {
  return (
    <SpinnerCircular size={25} thickness={100} speed={100} color={color ?? '#fff'} secondaryColor={'transparent'} style={style}/>
  )
}

export default MySpinner;