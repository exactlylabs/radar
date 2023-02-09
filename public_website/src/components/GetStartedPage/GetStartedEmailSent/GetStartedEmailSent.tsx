import {ReactElement} from "react";
import {styles} from "./styles/GetStartedEmailSent.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const CheckLogo = '/assets/images/email-sent-check-logo.png';
const HorizontalDivider = '/assets/images/separator-line-horizontal.png';
const ContactBg1 = '/assets/images/contact-bg-shape-1.png';
const ContactBg2 = '/assets/images/contact-bg-shape-2.png';
const ContactWhiteCircle = '/assets/images/contact-white-circle.png';

const GetStartedEmailSent = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.PageWrapper}>
      {!isSmall && <img src={ContactBg1} alt={'orange background'} style={styles.ContactBg1}/>}
      {!isSmall && <img src={ContactBg2} alt={'blue background'} style={styles.ContactBg2}/>}
      {!isSmall && <img src={ContactWhiteCircle} alt={'white circle'} style={styles.ContactWhiteCircle}/>}
      <div style={styles.GetStartedEmailSentHeader(isSmall)}>
        <img src={CheckLogo} style={styles.Logo(isSmall)} alt={'email sent tick icon'}/>
        <p className={'fw-extra-bold'} style={styles.Title(isSmall)}>We'll get in touch with you soon.</p>
        <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Thank you for your interest in Radar. We’ll get in touch with you as soon as possible. In the meantime, feel free to explore our tools.</p>
        <img src={HorizontalDivider} style={styles.HorizontalDivider(isSmall)} alt={'horizontal divider'}/>
        <p className={'fw-bold'} style={styles.ToolkitTitle(isSmall)}>Explore our toolkit solutions.</p>
        <p className={'fw-medium'} style={styles.ToolkitSubtitle(isSmall)}>Whether you’re a consumer, an Internet provider or a policy maker, our toolkit has you covered.</p>
      </div>
    </div>
  )
}

export default GetStartedEmailSent;