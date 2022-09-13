import {ReactElement} from "react";
import {styles} from "./styles/TopLevelTabsHeaderTab.style";
import {NavigateFunction, useNavigate} from "react-router-dom";

interface TopLevelTabsHeaderTabProps {
  text: string;
  url: string;
  selected: boolean;
  className: string;
}

const TopLevelTabsHeaderTab = ({
  text,
  url,
  selected,
  className
}: TopLevelTabsHeaderTabProps): ReactElement => {

  const navigate: NavigateFunction = useNavigate();

  const goToUrl = () => navigate(url);

  return (
    <div style={styles.TopLevelTabsHeaderTab(selected)}
         onClick={goToUrl}
         className={className}
    >
      <p className={'fw-medium'}>{text}</p>
      <div style={styles.HorizontalSelectedUnderline(selected)}></div>
    </div>
  )
}

export default TopLevelTabsHeaderTab;