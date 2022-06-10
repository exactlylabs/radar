import {FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";
import {useState} from "react";
import {MyTitle} from "../common/MyTitle";
import {MyButton} from "../common/MyButton";

const landingPageStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  width: '50%',
  alignItems: 'center',
  margin: '50px auto'
}

export const LandingPage = ({
  goToNextStep
}) => {

  const [selectedOption, setSelectedOption] = useState('manually');

  return (
    <div style={landingPageStyle}>
      <MyTitle text={'Test your internet speed'}/>
      <FormControl>
        <FormLabel>Insert your address</FormLabel>
        <RadioGroup defaultValue={'manually'}>
          <FormControlLabel
            control={<Radio/>}
            label={'Manually'}
            value={'manually'}
            onChange={e => setSelectedOption(e.target.value)}/>
          <FormControlLabel
            control={<Radio/>}
            label={'Automatic based on current location'}
            value={'automatic'}
            onChange={e => setSelectedOption(e.target.value)}/>
        </RadioGroup>
      </FormControl>
      <MyButton text={'Continue'} onClick={() => goToNextStep(selectedOption)}/>
    </div>
  );
}