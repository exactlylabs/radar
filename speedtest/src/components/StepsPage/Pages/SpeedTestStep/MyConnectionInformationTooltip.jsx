import {WHITE} from "../../../../utils/colors";
import {Tooltip} from "@mui/material";

const sx = {
  "& .MuiTooltip-arrow": {
    "&::before": {
      border: `1px solid rgba(17,14,76, 95%)`,
      backgroundColor: 'rgba(17,14,76, 95%)'
    },
  },
  "& .MuiTooltip-tooltip": {
    backgroundColor: 'rgba(17,14,76, 95%)',
    border: 'rgba(17,14,76, 95%)',
    color: WHITE,
    paddingLeft: '15px',
    paddingRight: '15px',
    paddingTop: '10px',
    paddingBottom: '10px',
  }
};

const tooltipStyle = {
  width: 'max-content',
  borderRadius: 6,
  boxShadow: `0 4px 15px -2px rgba(17 14 76, 20%)`,
}

const titleStyle = {
  color: WHITE,
  fontSize: 14,
}

const subtitleContainerStyle = {
  display: 'flex',
  flexDirection: 'row',
  maxWidth: 300,
  marginTop: 4,
}

const onlySubtitleContainerStyle = {
  ...subtitleContainerStyle,
  marginTop: 0,
}

const subtitleStyle = {
  width: '99%',
  color: WHITE,
  fontSize: 13,
  marginRight: 3,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const accentStyle = {
  color: WHITE,
  fontSize: 13,
}

const MyTooltipContent = ({
  title,
  subtitle,
  accent
}) => {

  return (
    <div style={tooltipStyle}>
      {title && <p className={'speedtest--p speedtest--bold'} style={titleStyle}>{title}</p>}
      <div style={title ? subtitleContainerStyle : onlySubtitleContainerStyle}>
        <p className={'speedtest--p speedtest--regular'} style={subtitleStyle}>{subtitle}</p>
        <p className={'speedtest--p speedtest--bold'} style={accentStyle}>{accent}</p>
      </div>
    </div>
  )
}

const MyConnectionInformationTooltip = ({
  children,
  title,
  subtitle,
  accent,
  shouldNotAppear
}) => {

  return (
    <Tooltip
      disableHoverListener={shouldNotAppear}
      title={<MyTooltipContent title={title} subtitle={subtitle} accent={accent}/>}
      arrow
      PopperProps={{sx}}
    >
      {children}
    </Tooltip>
  )
}

export default MyConnectionInformationTooltip;