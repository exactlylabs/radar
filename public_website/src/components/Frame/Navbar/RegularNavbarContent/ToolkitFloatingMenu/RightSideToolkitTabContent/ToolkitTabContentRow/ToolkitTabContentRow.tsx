import {ReactElement} from "react";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {styles} from "./styles/ToolkitTabContentRow.style";
import {useViewportSizes} from "../../../../../../../hooks/useViewportSizes";

interface ToolkitTabContentRowProps {
  icon: ReactElement;
  title: ToolkitTabContentRowTitle;
  subtitle?: ToolkitTabContentRowSubtitle;
  onClick: () => void;
}

const ToolkitTabContentRow = ({
  icon,
  title,
  subtitle,
  onClick
}: ToolkitTabContentRowProps): ReactElement => {

  const {isSmallScreen} = useViewportSizes();

  return (
    <div className={'hover-opaque'} style={styles.ToolkitTabContentRow(isSmallScreen)} onClick={onClick}>
      <div style={styles.IconContainer}>
        {icon}
      </div>
      <div style={styles.TextContainer}>
        <p className={'fw-bold'} style={styles.Title}>{title}</p>
        { !!subtitle && <p className={'fw-regular'} style={styles.Subtitle}>{subtitle}</p> }
      </div>
    </div>
  )
}

export default ToolkitTabContentRow;