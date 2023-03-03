import {ReactElement, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";
import {paths} from "../../utils/routes";
import {styles} from "./styles/SecondLevelContentHeader.style";

const SecondLevelContentHeader = (): ReactElement => {

  const location = useLocation();

  const [currentPathname, setCurrentPathname] = useState(location.pathname);

  useEffect(() => {
    setCurrentPathname(location.pathname);
  }, [location.pathname]);

  return (
    <div style={styles.SecondLevelContentHeader}>
      <p className={'fw-medium'} style={styles.Title}>{currentPathname === paths.EXPLORE ? 'Explore the map' : ''}</p>
      <p className={'fw-light'} style={styles.Subtitle}>{currentPathname === paths.EXPLORE ? 'Use our mapping tool to see how broadband speeds vary across the country.' : ''}</p>
    </div>
  )
}

export default SecondLevelContentHeader;