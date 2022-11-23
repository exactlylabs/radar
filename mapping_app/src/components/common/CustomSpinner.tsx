import {CSSProperties, ReactElement} from "react";
import {SpinnerCircular} from "spinners-react";

interface CustomSpinnerProps {
  color: string;
  style?: CSSProperties;
}

const CustomSpinner = ({color, style}: CustomSpinnerProps): ReactElement => {
  return (
    <SpinnerCircular size={25} thickness={100} speed={100} color={color ?? '#fff'} secondaryColor={'transparent'} style={style}/>
  )
}

export default CustomSpinner;