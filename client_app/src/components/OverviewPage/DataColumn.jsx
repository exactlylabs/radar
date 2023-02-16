import {DATA_COLUMN_ICON_CONTAINER, DEFAULT_SECONDARY_TEXT} from "../../utils/colors";

const dataColumnStyle = {
  width: '30%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center'
}

const stackedStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginBottom: '20px',
}

const lastStackedStyle = {
  ...stackedStyle,
  marginBottom: 0
}

const iconContainerStyle = {
  width: '54px',
  height: '54px',
  minWidth: '54px',
  minHeight: '54px',
  maxWidth: '54px',
  maxHeight: '54px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: DATA_COLUMN_ICON_CONTAINER,
  marginBottom: '10px',
}

const iconStyle = {
  width: '26px',
  height: '26px',
  minWidth: '26px',
  minHeight: '26px',
  maxWidth: '26px',
  maxHeight: '26px',
}

const titleStyle = {
  fontSize: '18px',
  lineHeight: '26px',
  margin: '0 0 7px 0',
  width: '100%',
}

const smallTitleStyle = {
  ...titleStyle,
  margin: '0 0 5px 0',
}

const textStyle = {
  fontSize: '17px',
  lineHeight: '28px',
  width: '100%',
  color: DEFAULT_SECONDARY_TEXT
}

const smallTextStyle = {
  fontSize: '16px',
  lineHeight: '26px',
  width: '100%',
  color: DEFAULT_SECONDARY_TEXT
}

const DataColumn = ({
  iconSrc,
  title,
  text,
  isStacked,
  isLast
}) => {
  return (
    <div style={isStacked ? isLast ? lastStackedStyle : stackedStyle : dataColumnStyle}>
      <div style={iconContainerStyle}>
        <img src={iconSrc} style={iconStyle} alt={'data column icon'}/>
      </div>
      <p className={'bold'} style={isStacked ? smallTitleStyle : titleStyle}>{title}</p>
      <p style={isStacked ? smallTextStyle : textStyle}>{text}</p>
    </div>
  )
}

export default DataColumn;