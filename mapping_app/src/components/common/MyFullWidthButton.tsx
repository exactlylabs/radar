import {ReactElement} from "react";
import {styles} from "./styles/MyFullWidthButton.style";

interface MyFullWidthButtonProps {
  text: string;
  onClick: () => void;
  icon?: ReactElement;
  iconFirst?: boolean;
  backgroundColor?: string;
  color?: string;
  className?: string;
}

const MyFullWidthButton = ({
  text,
  icon,
  iconFirst,
  backgroundColor,
  color,
  onClick,
  className,
}: MyFullWidthButtonProps): ReactElement => {
  return iconFirst ?
  <div className={className} style={styles.ButtonContainer(!!icon, backgroundColor, color)} onClick={onClick}>
    {icon}
    <p className={'fw-medium'} style={styles.Text}>{text}</p>
  </div>
  :
  <div className={className} style={styles.ButtonContainer(!!icon, backgroundColor, color)} onClick={onClick}>
    <p className={'fw-medium'} style={styles.Text}>{text}</p>
    {icon}
  </div>;
}

export default MyFullWidthButton;