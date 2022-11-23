import {ReactElement} from "react";
import {styles} from "./styles/MyFullWidthButton.style";

interface CustomFullWidthButtonProps {
  text: string;
  icon: ReactElement;
  iconFirst?: boolean;
  backgroundColor?: string;
  color?: string;
}

const CustomFullWidthButton = ({
  text,
  icon,
  iconFirst,
  backgroundColor,
  color,
}: CustomFullWidthButtonProps): ReactElement => {
  return iconFirst ?
  <div style={styles.ButtonContainer(backgroundColor, color)}>
    {icon}
    <p className={'fw-medium'} style={styles.Text}>{text}</p>
  </div>
  :
  <div style={styles.ButtonContainer(backgroundColor, color)}>
    <p className={'fw-medium'} style={styles.Text}>{text}</p>
    {icon}
  </div>;
}

export default CustomFullWidthButton;