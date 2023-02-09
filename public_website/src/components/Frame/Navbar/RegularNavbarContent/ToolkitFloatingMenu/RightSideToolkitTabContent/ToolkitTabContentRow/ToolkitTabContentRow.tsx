import {ReactElement} from "react";
import {ToolkitTabContentRowSubtitle, ToolkitTabContentRowTitle} from "../../types";
import {styles} from "./styles/ToolkitTabContentRow.style";
import {useViewportSizes} from "../../../../../../../hooks/useViewportSizes";
import { AppRoutes } from "../../../../../../../utils/navigation";

interface ToolkitTabContentRowProps {
  icon: ReactElement;
  title: ToolkitTabContentRowTitle;
  subtitle?: ToolkitTabContentRowSubtitle;
  isFirst?: boolean;
  extraIcon?: ReactElement;
  link: string;
  openNewTab?: boolean;
}

const ToolkitTabContentRow = ({
  icon,
  title,
  subtitle,
  isFirst,
  extraIcon,
  link,
  openNewTab
}: ToolkitTabContentRowProps): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <a href={link} target={openNewTab ? '_blank' : '_self'} style={{margin: 0, textDecoration: 'none'}} rel="noreferrer">
      <div className={'hover-opaque'} style={styles.ToolkitTabContentRow(isSmall, isFirst)}>
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
    </a>
  )
}

export default ToolkitTabContentRow;