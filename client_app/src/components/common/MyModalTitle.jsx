import {DEFAULT_TITLE_COLOR} from "../../utils/colors";

const titleStyle = {
  fontFamily: 'MulishExtraBold',
  fontSize: 24,
  color: DEFAULT_TITLE_COLOR,
  marginBottom: 10,
  paddingTop: 30,
}

export const MyModalTitle = ({ text, style }) => {
  return (
    <div style={{...titleStyle, ...style}}>
      {text}
    </div>
  );
};