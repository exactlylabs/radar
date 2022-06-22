import React, {useState} from 'react';
import {FormControl, TextField} from "@mui/material";
import {MyButton} from "../common/MyButton";
import {MyTitle} from "../common/MyTitle";

const FormPage = ({ goToNextStep }) => {

  const [formData, setFormData] = useState({name: null, number: null});

  const handleInputChange = e => {
    const value = e.target.value;
    const input = e.target.name;
    const values = {...formData};
    values[input] = value;
    setFormData(values);
  }

  return (
    <div style={{textAlign: 'center', width: '80%', margin: '10px auto'}}>
      <MyTitle text={'Address information'}/>
      <FormControl fullWidth style={{textAlign: 'center', margin: "auto"}}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
          <TextField
            required
            label={'Street name'}
            type={'text'}
            placeholder={'Insert your street name'}
            name={'name'}
            onChange={handleInputChange}
            margin={'normal'}
            style={{width: '50%', minWidth: 200, maxWidth: 500, marginRight: 20}}
            variant={'standard'}
          />
          <TextField
            required
            label={'Street number'}
            type={'number'}
            placeholder={'Insert your street number'}
            name={'number'}
            onChange={handleInputChange}
            margin={'normal'}
            variant={'standard'}
            style={{maxWidth: 150}}
          />
        </div>
        <MyButton
          style={{width: '25%', margin: '20px auto'}}
          text={'Submit'}
          onClick={() => goToNextStep(formData)}
          disabled={!formData.name || !formData.number}
        />
      </FormControl>
    </div>
  );
}

export default FormPage;