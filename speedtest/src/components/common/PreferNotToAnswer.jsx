import {useState} from "react";
import {DEFAULT_SKIP_FONT_COLOR} from "../../utils/colors";
import {useViewportSizes} from "../../hooks/useViewportSizes";
import ArrowRightIcon from '../../assets/icons-right-arrow.png';
import ArrowRightIconHovered from '../../assets/icons-right-arrow-hovered.png';

const textStyle = {
  fontSize: 15,
  color: DEFAULT_SKIP_FONT_COLOR,
  marginTop: 30,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  marginBottom: 70
}

const mobileTextStyle = {
  ...textStyle,
  marginTop: -40,
}

const iconStyle = {
  marginLeft: 5,
}

const PreferNotToAnswer = ({
  goForward
}) => {

  const {isMediumSizeScreen} = useViewportSizes();
  const [hovered, setHovered] = useState(false);

  const hoverOn = () => setHovered(true);

  const hoverOff = () => setHovered(false);

  return (
    <div className={'bold'}
         style={isMediumSizeScreen ? mobileTextStyle : textStyle}
         onClick={goForward}
         onMouseEnter={hoverOn}
         onMouseLeave={hoverOff}
    >
      <p className={'regular-link--hoverable'}>Skip this question</p>
      {
        hovered ?
          <img src={ArrowRightIconHovered} width={10} height={10} style={iconStyle} alt={'move-forward-icon'}/> :
          <img src={ArrowRightIcon} width={10} height={10} style={iconStyle} alt={'move-forward-icon'}/>
      }
    </div>
  );
};

export default PreferNotToAnswer;