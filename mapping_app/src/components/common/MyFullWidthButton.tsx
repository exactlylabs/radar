import {ReactElement} from "react";
import {styles} from "./styles/MyFullWidthButton.style";

interface MyFullWidthButtonProps {
  text: string;
  icon: ReactElement;
  iconFirst?: boolean;
  backgroundColor?: string;
  color?: string;
}

const MyFullWidthButton = ({
  text,
  icon,
  iconFirst,
  backgroundColor,
  color,
}: MyFullWidthButtonProps): ReactElement => {
  return iconFirst ?
  <div style={styles.ButtonContainer(backgroundColor, color)}>
    {icon}
    <p className={'fw-medium'} style={styles.Text()}>{text}</p>
  </div>
  :
  <div style={styles.ButtonContainer(backgroundColor, color)}>
    <p className={'fw-medium'} style={styles.Text()}>{text}</p>
    {icon}
  </div>;
}

export default MyFullWidthButton;