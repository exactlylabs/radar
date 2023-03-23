export const defaultButtonStyle = {
  width: 'max-content',
  height: 45,
  borderRadius: 24,
  paddingRight: 25,
  paddingLeft: 25,
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
  zIndex: 5,
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
};

export const MyButton = ({ text, onClick, disabled, icon, iconFirst, fullWidth }) => {
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
