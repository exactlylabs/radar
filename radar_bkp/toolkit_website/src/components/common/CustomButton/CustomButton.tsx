import {ReactElement} from "react";
import {styles} from "./styles/CustomButton.style";

interface CustomButtonProps {
  text: string;
  backgroundColor?: string;
  boxShadow?: string;
  color?: string;
  icon?: ReactElement | null;
  iconFirst?: boolean;
  link?: string;
  openNewTab?: boolean;
  isFullWidth?: boolean;
  onClick?: () => void;
}

const CustomButton = ({
  text,
  backgroundColor,
  boxShadow,
  color,
  icon,
  iconFirst,
  link,
  openNewTab,
  isFullWidth,
  onClick
}: CustomButtonProps): ReactElement => {

  const linkButton = (
    <a style={styles.CustomButton(backgroundColor, boxShadow, isFullWidth)}
       className={'hover-opaque'}
       href={link}
       target={openNewTab ? '_blank' : '_self'}
       rel={'noreferrer'}
    >
      {iconFirst ?
        <>
          {icon}
          <p className={'fw-bold'} style={styles.Text(color)}>{text}</p>
        </> :
        <>
          <p className={'fw-bold'} style={styles.Text(color)}>{text}</p>
          {icon}
        </>
      }
    </a>
  );

  const regularButton = (
    <button style={styles.CustomButton(backgroundColor, boxShadow, isFullWidth)}
            className={'hover-opaque'}
            onClick={onClick}
    >
      {iconFirst ?
        <>
          {icon}
          <p className={'fw-bold'} style={styles.Text(color)}>{text}</p>
        </> :
        <>
          <p className={'fw-bold'} style={styles.Text(color)}>{text}</p>
          {icon}
        </>
      }
    </button>
  )

  return link && !onClick ? linkButton : regularButton;
}

export default CustomButton;