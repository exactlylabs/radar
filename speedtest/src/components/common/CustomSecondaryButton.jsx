export const defaultSecondaryButtonStyle = {
  width: 'max-content',
  height: 45,
  borderRadius: 24,
  paddingRight: 25,
  paddingLeft: 25,
  paddingTop: 8,
  paddingBottom: 8,
  border: 'solid 2px #4b7be5',
  fontSize: 16,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
};

export const CustomSecondaryButton = ({ text, onClick, disabled, icon, iconFirst, fullWidth }) => {
  return iconFirst ?
    <button className={'bold blue-secondary-button--hoverable'} style={fullWidth ? {...defaultSecondaryButtonStyle, width: '100%'} : defaultSecondaryButtonStyle} onClick={onClick} disabled={disabled}>
      {icon}
      {text}
    </button> :
    <button className={'bold blue-secondary-button--hoverable'} style={fullWidth ? {...defaultSecondaryButtonStyle, width: '100%'} : defaultSecondaryButtonStyle} onClick={onClick} disabled={disabled}>
      {text}
      {icon}
    </button>
};
