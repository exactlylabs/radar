import { DEFAULT_HEADER_BACKGROUND_COLOR, WHITE } from '../../utils/colors';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';
import radarLogoLight from '../../assets/radar-logo-light.png';

const headerStyle = {
  backgroundColor: DEFAULT_HEADER_BACKGROUND_COLOR,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: 70,
  width: '100%',
  fontWeight: 'bold',
};

const contentWrapperStyle = {
  width: '90%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
};

const leftSideContainerStyle = {
  width: '25%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: WHITE,
  fontSize: 16,
  minWidth: 250,
};

const rightSideContainerStyle = {
  width: '70%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
};

const navElementStyle = {
  cursor: 'pointer',
  color: WHITE,
};

const Header = ({ setStep }) => {
  const goToHome = () => setStep(STEPS.LANDING);

  const goToTestSpeed = () => setStep(STEPS.LANDING);

  return (
    <div style={headerStyle}>
      <div className={'header--content-wrapper'} style={contentWrapperStyle}>
        <div className={'header--left-side-container'} style={leftSideContainerStyle}>
          <img
            src={radarLogoLight}
            alt={'Radar-logo=light'}
            width={104}
            height={25}
            onClick={goToHome}
            style={navElementStyle}
          />
          <div onClick={goToHome} style={navElementStyle}>
            Home
          </div>
          <div style={navElementStyle}>About Us</div>
        </div>
        <div className={'header--right-side-container'} style={rightSideContainerStyle}>
          <MyButton text={'Test your speed'} onClick={goToTestSpeed} />
        </div>
      </div>
    </div>
  );
};

export default Header;
