import {ReactElement} from "react";
import {ToolkitTabSubtitle, ToolkitTabTitle} from "../../types";
import {styles} from "./styles/ToolkitTabOption.style";

interface ToolkitTabOptionProps {
  title: ToolkitTabTitle;
  subtitle: ToolkitTabSubtitle;
  selected: boolean;
  onHover: () => void;
}

const ToolkitTabOption = ({
  title,
  subtitle,
  selected,
  onHover
}: ToolkitTabOptionProps): ReactElement => {

  const isFirstTab = () => title === ToolkitTabTitle.POLICY_MAKERS;
  const isLastTab = () => title === ToolkitTabTitle.INTERNET_PROVIDERS;

  return (
    <div style={styles.ToolkitTabOption(isFirstTab(), isLastTab(), selected)}
         className={'toolkit-tabs--option'}
         onMouseOver={onHover}
    >
      <p className={'fw-bold'} style={styles.Title}>{title}</p>
      <p className={'fw-regular'} style={styles.Subtitle}>{subtitle}</p>
    </div>
  );
}

export default ToolkitTabOption;