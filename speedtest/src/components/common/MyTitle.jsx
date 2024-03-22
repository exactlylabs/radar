import { useContext } from "react";
import {DEFAULT_TITLE_COLOR} from "../../utils/colors";
import ConfigContext from "../../context/ConfigContext";

const titleStyle = {
  fontFamily: 'MulishExtraBold',
  fontSize: 26,
  color: DEFAULT_TITLE_COLOR,
  marginBottom: 10,
  width: '100%',
  maxWidth: '480px',
  marginInline: 'auto'
}

const widgetTitleStyle = {
  ...titleStyle,
  maxWidth: 'none',
  fontSize: 24
}

export const MyTitle = ({ text }) => {

  const config = useContext(ConfigContext);

  return (
    <p className={'speedtest--p'} style={config.widgetMode ? widgetTitleStyle : titleStyle}>{text}</p>
  );
};
