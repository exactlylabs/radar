import React, {useEffect, useState} from 'react';
import {CircularProgress, FormControl, TextField} from '@mui/material';
import { MyButton } from '../common/MyButton';
import { MyTitle } from '../common/MyTitle';
import {getGeocodedAddress} from "../../utils/apiRequests";
import {usePrev} from "../../utils/usePrev";

const FormPage = ({ goToNextStep }) => {
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [formData, setFormData] = useState({ address: null });
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(false);

  const prevState = usePrev({searchingAddress});

  useEffect(() => {
    const isNotLoadingAnymore = prevState && prevState.searchingAddress && !searchingAddress;
    if(isNotLoadingAnymore && !error) {
      goToNextStep(location);
    }
  }, [searchingAddress, error]);

  const handleInputChange = e => {
    const value = e.target.value;
    const input = e.target.name;
    const values = { ...formData };
    values[input] = value;
    setFormData(values);
  };

  const handleSubmit = () => {
    setError(false);
    setSearchingAddress(true);
    const addressFormData = new FormData();
    addressFormData.append('address', formData.address);
    getGeocodedAddress(addressFormData, setSearchingAddress, setLocation, setError);
  }

  return (
    <div style={{ textAlign: 'center', width: '80%', margin: '10px auto' }}>
      <MyTitle text={'Address information'} />
      <FormControl fullWidth style={{ textAlign: 'center', margin: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
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
            error={error}
            autoComplete={'off'}
          />
          { error && <p style={{color: 'red'}}>The search returned no results!</p> }
        </div>
        <div style={{ width: 'max-content', margin: '20px auto' }}>
          <MyButton
            text={
              searchingAddress ?
                <CircularProgress size={25} color={'inherit'}/> :
                'Submit'
            }
            onClick={handleSubmit}
            disabled={!formData.address || searchingAddress}
          />
        </div>
      </FormControl>
    </div>
  );
};

export default FormPage;
