import poweredByLogo from '../../assets/powered-by-logo.png'
import LanguageSelector from '../common/LanguageSelector'
import { useTranslation } from 'react-i18next'

const exactlyLabsHeaderStyle = {
  width: '100%',
  height: '40px',
  backgroundColor: 'black',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
}

const languageSelectorContainerStyle = {
  position: 'absolute',
  right: '20px',
  top: '50%',
  transform: 'translateY(-50%)'
}

const ExactlyLabsHeader = () => {
  const { t } = useTranslation();

  return (
    <div style={exactlyLabsHeaderStyle}>
      <img src={poweredByLogo} width={159} height={20} alt={t('alt.logos.poweredBy', 'Powered by Exactly Labs')}/>
      <div style={languageSelectorContainerStyle}>
        <LanguageSelector />
      </div>
    </div>
  )
}

export default ExactlyLabsHeader