export const defaultButtonStyle = {
  width: 'max-content',
  height: 38,
  borderRadius: 19,
  paddingRight: 20,
  paddingLeft: 20,
  paddingTop: 8,
  paddingBottom: 8,
  border: 'none',
  fontSize: 16,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  position: 'relative',
  zIndex: 5
};

export const CustomNarrowButton = ({ text, onClick, disabled, icon, iconFirst, fullWidth }) => {
  return iconFirst ?
    <button className={'speedtest--bold speedtest--blue-button--hoverable'} style={fullWidth ? {...defaultButtonStyle, width: '100%'} : defaultButtonStyle} onClick={onClick} disabled={disabled}>
      {icon}
      {text}
    </button> :
    <button className={'speedtest--bold speedtest--blue-button--hoverable'} style={fullWidth ? {...defaultButtonStyle, width: '100%'} : defaultButtonStyle} onClick={onClick} disabled={disabled}>
      {text}
      {icon}
    </button>
};
