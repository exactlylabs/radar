import React, { useState } from 'react';
import { FormControl, TextField } from '@mui/material';
import { MyButton } from '../common/MyButton';
import { MyTitle } from '../common/MyTitle';

const FormPage = ({ goToNextStep }) => {
  const [formData, setFormData] = useState({ address: null });

  const handleInputChange = e => {
    const value = e.target.value;
    const input = e.target.name;
    const values = { ...formData };
    values[input] = value;
    setFormData(values);
  };

  const handleSubmit = () => goToNextStep(formData);

  return (
    <div style={{ textAlign: 'center', width: '80%', margin: '10px auto' }}>
      <MyTitle text={'Address information'} />
      <FormControl fullWidth style={{ textAlign: 'center', margin: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
          <TextField
            required
            label={'Full Address'}
            type={'text'}
            placeholder={'Insert your full address'}
            name={'address'}
            onChange={handleInputChange}
            margin={'normal'}
            fullWidth
            variant={'standard'}
          />
        </div>
        <MyButton
          style={{ width: '25%', margin: '20px auto' }}
          text={'Submit'}
          onClick={handleSubmit}
          disabled={!formData.address}
        />
      </FormControl>
    </div>
  );
};

export default FormPage;
