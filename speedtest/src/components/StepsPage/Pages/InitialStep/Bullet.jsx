import {DATA_COLUMN_ICON_CONTAINER, DEFAULT_SECONDARY_TEXT, DEFAULT_TEXT_COLOR} from "../../../../utils/colors";
import {useViewportSizes} from "../../../../hooks/useViewportSizes";

const bulletContainerStyle = {
  maxWidth: '335px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
}

const smallBulletContainerStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  marginBottom: '30px',
}

const iconContainer = {
  width: '54px',
  height: '54px',
  minWidth: '54px',
  minHeight: '54px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: '15px',
  backgroundColor: DATA_COLUMN_ICON_CONTAINER
}

const smallIconContainer = {
  ...iconContainer,
  marginRight: 0,
  marginBottom: '10px'
}

const textContainer = {
  maxWidth: '250px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  textAlign: 'left'
}

const smallTextContainer = {
  ...textContainer,
  width: '100%',
  maxWidth: undefined,
  textAlign: 'center'
}

const titleStyle = {
  fontSize: '17px',
  lineHeight: '26px',
  color: DEFAULT_TEXT_COLOR,
  margin: '0 0 4px 0',
  width: '100%'
}

const subtitleStyle = {
  fontSize: '16px',
  lineHeight: '26px',
  color: DEFAULT_SECONDARY_TEXT,
  margin: '0',
  width: '100%'
}

const Bullet = ({icon, title, subtitle}) => {

  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();
  const isSmall = isSmallSizeScreen || isMediumSizeScreen;


  return (
    <div style={isSmall ? smallBulletContainerStyle : bulletContainerStyle}>
      <div style={isSmall ? smallIconContainer : iconContainer}>
        {icon}
      </div>
      <div style={isSmall ? smallTextContainer : textContainer}>
        <p className={'bold'} style={titleStyle}>{title}</p>
        <p style={subtitleStyle}>{subtitle}</p>
      </div>
    </div>
  )
}

export default Bullet;