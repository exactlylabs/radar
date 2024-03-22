import {useState} from "react";
import {DEFAULT_SKIP_FONT_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import ArrowRightIcon from '../../assets/icons-right-arrow.png';
import ArrowRightIconHovered from '../../assets/icons-right-arrow-hovered.png';

const textStyle = {
  fontSize: 15,
  color: DEFAULT_SKIP_FONT_COLOR,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  marginBottom: 70
}

const mobileTextStyle = {
  ...textStyle,
  marginTop: '2rem'
}

const iconStyle = {
  marginLeft: 5,
}

const PreferNotToAnswer = ({
  goForward,
  text
}) => {

  const {isMediumSizeScreen} = useViewportSizes();
  const [hovered, setHovered] = useState(false);

  const hoverOn = () => setHovered(true);

  const hoverOff = () => setHovered(false);

  return (
    <div className={'speedtest--bold'}
         style={isMediumSizeScreen ? mobileTextStyle : textStyle}
         onClick={goForward}
         onMouseEnter={hoverOn}
         onMouseLeave={hoverOff}
    >
      <p className={'speedtest--p speedtest--regular-link--hoverable speedtest--bold '}>{text ? text : 'Skip this question'}</p>
      {
        hovered ?
          <img src={ArrowRightIconHovered} width={10} height={10} style={iconStyle} alt={'move-forward-icon'}/> :
          <img src={ArrowRightIcon} width={10} height={10} style={iconStyle} alt={'move-forward-icon'}/>
      }
    </div>
  );
};

export default PreferNotToAnswer;