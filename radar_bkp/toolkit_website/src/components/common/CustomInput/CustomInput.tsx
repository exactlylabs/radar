import React, {Ref} from "react";
import {styles} from "./styles/CustomInput.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface CustomInputProps {
  name: string;
  type: string;
  placeholder: string;
  error?: boolean;
  errorMessage?: string;
  setError?: (msg: string | boolean) => void;
  matcher?: RegExp;
}

const CustomInput = React.forwardRef((props: CustomInputProps, ref: Ref<HTMLInputElement>) => {
  const {type, name, error, placeholder, errorMessage, setError, matcher} = props;
  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const handleChange = (e: any) => {
    if(!matcher || !setError || !errorMessage) {
      return;
    } else if(!matcher.test(e.target.value)) {
      setError(errorMessage);
    } else {
      setError(false);
    }
  }

  return (
    <input type={type}
           name={name}
           ref={ref}
           style={styles.Input(isSmall)}
           className={`custom-input ${error ? 'custom-input-error' : ''}`}
           placeholder={placeholder}
           onChange={handleChange}
    />
  )
});

export default CustomInput;