import React from 'react';
import { MyButton } from '../common/MyButton';
import { STEPS } from '../../constants';

const Frame = ({ config, children, step, setStep }) => {
  const handleBack = () => setStep(STEPS.LANDING);

  return (
    <div style={{ ...config.frameStyle }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', margin: 10 }}>
        {step !== 'landing' && <MyButton text={'< Back'} onClick={handleBack} style={{ marginTop: 10 }} />}
      </div>
      {children}
    </div>
  );
};

export default Frame;
