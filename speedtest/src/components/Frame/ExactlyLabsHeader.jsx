import poweredByLogo from  '../../assets/powered-by-logo.png'

const exactlyLabsHeaderStyle = {
  width: '100%',
  height: '40px',
  backgroundColor: 'black',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

export default () => {
  return (
    <div style={exactlyLabsHeaderStyle}>
      <img src={poweredByLogo} width={159} height={20}/>
    </div>
  )
}