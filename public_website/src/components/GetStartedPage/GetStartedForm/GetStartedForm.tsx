import {ReactElement, useRef, useState} from "react";
import {styles} from "./styles/GetStartedForm.style";
import CustomInput from "../../common/CustomInput/CustomInput";
import CustomCheckbox from "../../common/CustomCheckbox/CustomCheckbox";
import CustomButton from "../../common/CustomButton/CustomButton";
import {DEFAULT_PRIMARY_BUTTON, DEFAULT_PRIMARY_BUTTON_BOX_SHADOW, WHITE} from "../../../utils/colors";
import {MailReply, submitContactData} from "../../../../pages/api/requests";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {ClipLoader} from "react-spinners";

const ContactBg1 = '/assets/images/contact-bg-shape-1.png';
const ContactBg2 = '/assets/images/contact-bg-shape-2.png';
const SmallContactBg1 = '/assets/images/small-contact-bg-shape-1.png';
const SmallContactBg2 = '/assets/images/small-contact-bg-shape-2.png';
const ContactWhiteCircle = '/assets/images/contact-white-circle.png';

interface GetStartedFormProps {
  onSubmit: () => void;
}

interface ICheckboxes {
  siteMonitoring: boolean;
  broadbandTesting: boolean;
  mappingTools: boolean;
  other: boolean;
}

interface IInterestPrettyPrint {
  siteMonitoring: string;
  broadbandTesting: string;
  mappingTools: string;
  other: string;
}

const interestPrettyPrint: IInterestPrettyPrint = {
  siteMonitoring: 'Site Monitoring',
  broadbandTesting: 'Consumer Broadband Testing',
  mappingTools: 'Mapping Tools',
  other: 'Other',
}

interface IErrors {
  name: boolean | string;
  email: boolean | string;
}

export interface IMailBody {
  name: string;
  email: string;
  company?: string;
  phoneNumber?: string;
  interests?: string[];
  otherInterest?: string;
}

const emptyErrors: IErrors = {
  name: false,
  email: false
}

const GetStartedForm = ({onSubmit}: GetStartedFormProps): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const interestRef = useRef<HTMLInputElement>(null);

  const [checkboxes, setCheckboxes] = useState<ICheckboxes>({
    siteMonitoring: false,
    broadbandTesting: false,
    mappingTools: false,
    other: false,
  });
  const [errors, setErrors] = useState<IErrors>(emptyErrors);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (value: boolean, key: string) => {
    let copy = {...checkboxes};
    copy[key as keyof ICheckboxes] = value;
    setCheckboxes(copy);
  }

  const handleSubmit = () => {
    if(!nameRef.current || !emailRef.current) return;
    let possibleErrors: IErrors = {name: false, email: false};
    const requiredMessage = 'This field is required.';
    if(!nameRef.current.value) possibleErrors.name = requiredMessage;
    if(!emailRef.current.value) possibleErrors.email = requiredMessage;
    if(possibleErrors.name !== false || possibleErrors.email !== false) {
      setErrors(possibleErrors);
      return;
    }
    setErrors(emptyErrors);
    setLoading(true);
    const mailBody: IMailBody = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      phoneNumber: phoneRef.current!.value,
      company: companyRef.current!.value,
      interests: getInterests(),
      otherInterest: interestRef.current?.value,
    }
    submitContactData(mailBody)
      .then(res => {
        if(res.msg === MailReply.OK) onSubmit();
        if(res.msg === MailReply.ERROR) displayError();
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }

  const getInterests = () => {
    return Object
      .keys(checkboxes)
      .filter(key => checkboxes[key as keyof ICheckboxes])
      .map(key => getInterestsPrettyPrint(key));
  }

  const getInterestsPrettyPrint = (key: string) => {
    return interestPrettyPrint[key as keyof IInterestPrettyPrint];
  }

  const displayError = () => {

  }

  return (
    <div style={styles.PageWrapper}>
      <div style={styles.GradientsLayer(isSmall)}>
        {!isSmall && <img src={ContactBg1} alt={'orange background'} style={styles.ContactBg1}/>}
        {!isSmall && <img src={ContactBg2} alt={'blue background'} style={styles.ContactBg2}/>}
        {isSmall  && <img src={SmallContactBg1} alt={'orange background'} style={styles.SmallContactBg1}/>}
        {isSmall  && <img src={SmallContactBg2} alt={'blue background'} style={styles.SmallContactBg2}/>}
        <img src={ContactWhiteCircle} alt={'white circle'} style={styles.ContactWhiteCircle(isSmall)}/>
      </div>
      <div style={styles.ContentWrapper(isSmall)}>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>Get started with our toolkit.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Fill out the form and we'll get in touch with you to help you get started with Radar.</p>
        <div style={styles.FormContainer(isSmall)}>
          <div style={styles.FormGroup}>
            <label className={'fw-medium'} htmlFor={'name'} style={styles.Label}>Name</label>
            <CustomInput name={'name'}
                         type={'text'}
                         ref={nameRef}
                         placeholder={'Your name'}
                         error={!!errors.name}
            />
            {!!errors.name && <p className={'fw-regular'} style={styles.ErrorLabel}>{errors.name}</p>}
          </div>
          <div style={styles.FormGroup}>
            <label className={'fw-medium'} htmlFor={'email'} style={styles.Label}>Email address</label>
            <CustomInput name={'email'}
                         type={'email'}
                         ref={emailRef}
                         placeholder={'your@emailaddress.com'}
                         error={!!errors.email}
                         errorMessage={'Please enter a valid email address.'}
                         setError={(str: string | boolean) => setErrors({...errors, email: str})}
                         matcher={new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)}
            />
            {!!errors.email && <p className={'fw-regular'} style={styles.ErrorLabel}>{errors.email}</p>}
          </div>
          <div style={styles.FormGroup}>
            <label className={'fw-medium'} htmlFor={'company'} style={styles.Label}>Company/Organization <span className={'fw-medium'} style={styles.OptionalLabel}>(Optional)</span></label>
            <CustomInput name={'company'} type={'text'} ref={companyRef} placeholder={'Your organization'}/>
          </div>
          <div style={styles.FormGroup}>
            <label className={'fw-medium'} htmlFor={'phone'} style={styles.Label}>Phone number <span className={'fw-medium'} style={styles.OptionalLabel}>(Optional)</span></label>
            <CustomInput name={'phone'} type={'phone'} ref={phoneRef} placeholder={'+1 (555) 000-0000'}/>
          </div>
          <div style={styles.InterestsGroup}>
            <label className={'fw-medium'} htmlFor={'interests'} style={styles.Label}>I'm interested in...</label>
            <div style={styles.CheckboxRow(false)}>
              <div style={styles.CheckboxCell('175px')}>
                <CustomCheckbox isChecked={checkboxes.siteMonitoring}
                                setIsChecked={(value: boolean) => handleCheckboxChange(value, 'siteMonitoring')}
                />
                <p className={'fw-medium'} style={styles.CheckboxLabel}>Site Monitoring</p>
              </div>
              <div style={styles.CheckboxCell('max-content')}>
                <CustomCheckbox isChecked={checkboxes.broadbandTesting} setIsChecked={(value: boolean) => handleCheckboxChange(value, 'broadbandTesting')}/>
                <p className={'fw-medium'} style={styles.CheckboxLabel}>Consumer Broadband Testing</p>
              </div>
            </div>
            <div style={styles.CheckboxRow(true)}>
              <div style={styles.CheckboxCell('140px')}>
                <CustomCheckbox isChecked={checkboxes.mappingTools} setIsChecked={(value: boolean) => handleCheckboxChange(value, 'mappingTools')}/>
                <p className={'fw-medium'} style={styles.CheckboxLabel}>Mapping Tools</p>
              </div>
              <div style={styles.CheckboxCell('max-content')}>
                <CustomCheckbox isChecked={checkboxes.other} setIsChecked={(value: boolean) => handleCheckboxChange(value, 'other')}/>
                <p className={'fw-medium'} style={styles.CheckboxLabel}>Other</p>
              </div>
            </div>
            { checkboxes.other && <CustomInput name={'interest'} type={'text'} ref={interestRef} placeholder={'Tell us what you are interested in...'}/>}
            <div style={styles.ConsentTextContainer(checkboxes.other)}>
              <span style={styles.ConsentText}>By continuing, you are consenting to our <a href={'/privacy-policy'} className={'custom-link'}>Privacy Policy</a> and allowing us to contact you.</span>
            </div>
            <div style={styles.ButtonContainer(isSmall)}>
              <CustomButton text={loading ? '' : 'Continue'}
                            isFullWidth
                            backgroundColor={DEFAULT_PRIMARY_BUTTON}
                            color={WHITE}
                            boxShadow={`0 4px 15px -2px ${DEFAULT_PRIMARY_BUTTON_BOX_SHADOW}`}
                            onClick={handleSubmit}
                            iconFirst
                            icon={loading ? <ClipLoader color="#fff" size={'10px'}/> : null}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GetStartedForm;