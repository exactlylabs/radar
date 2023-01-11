import {ReactElement} from "react";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {styles} from "./styles/ToolkitTabContentRow.style";
import {useViewportSizes} from "../../../../../../../hooks/useViewportSizes";

interface ToolkitTabContentRowProps {
  icon: ReactElement;
  title: ToolkitTabContentRowTitle;
  subtitle?: ToolkitTabContentRowSubtitle;
  onClick: () => void;
  isFirst?: boolean;
  extraIcon?: ReactElement;
}

const ToolkitTabContentRow = ({
  icon,
  title,
  subtitle,
  onClick,
  isFirst,
  extraIcon
}: ToolkitTabContentRowProps): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div className={'hover-opaque'} style={styles.ToolkitTabContentRow(isSmall, isFirst)} onClick={onClick}>
      <div style={styles.IconContainer}>
        {icon}
      </div>
      <div style={styles.TextContainer}>
        { !!extraIcon ?
          <div style={styles.TitleWithIconContainer}>
            <p className={'fw-bold'} style={styles.Title}>{title}</p>
            {extraIcon }
          </div> :
          <p className={'fw-bold'} style={styles.Title}>{title}</p>
        }
        { !!subtitle && <p className={'fw-regular'} style={styles.Subtitle}>{subtitle}</p> }
      </div>
    </div>
  )
}

export default ToolkitTabContentRow;