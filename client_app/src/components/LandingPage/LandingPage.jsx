import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { useState } from 'react';
import { MyTitle } from '../common/MyTitle';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';

const landingPageStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  overflowY: 'auto',
  maxWidth: 500,
  marginLeft: 'auto',
  marginRight: 'auto',
};

export const LandingPage = ({ setStep }) => {
  const [selectedOption, setSelectedOption] = useState(STEPS.FORM);

  const handleSelect = e => setSelectedOption(e.target.value);

  const handleContinue = () => setStep(selectedOption);

  const handleSeeAll = () => setStep(STEPS.ALL_RESULTS);

  return (
    <div style={landingPageStyle}>
      <MyTitle text={'Test your internet speed'} />
      <FormControl style={{ width: '80%' }}>
        <FormLabel>Insert your address</FormLabel>
        <RadioGroup defaultValue={STEPS.FORM}>
          <FormControlLabel control={<Radio />} label={'Manually'} value={STEPS.FORM} onChange={handleSelect} />
          <FormControlLabel
            control={<Radio />}
            label={'Automatic based on location'}
            value={STEPS.MAP}
            onChange={handleSelect}
          />
        </RadioGroup>
      </FormControl>
      <MyButton text={'Continue'} onClick={handleContinue} style={{ marginTop: 10 }} />
      <MyButton text={'See all measurements'} onClick={handleSeeAll} style={{ marginTop: 50 }} />
    </div>
  );
};
