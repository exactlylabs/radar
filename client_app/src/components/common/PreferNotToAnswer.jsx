import ArrowRightIcon from '../../assets/icons-right-arrow.png';
import {DEFAULT_SKIP_FONT_COLOR} from "../../utils/colors";

const textStyle = {
  fontSize: 15,
  color: DEFAULT_SKIP_FONT_COLOR,
  fontWeight: 'bold',
  marginTop: 30,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
}

const iconStyle = {
  marginLeft: 5,
}

const PreferNotToAnswer = ({
  goForward
}) => (
  <div style={textStyle} onClick={goForward}>
    I prefer not to answer
    <img src={ArrowRightIcon} width={10} height={10} style={iconStyle} alt={'move-forward-icon'}/>
  </div>
);

export default PreferNotToAnswer;