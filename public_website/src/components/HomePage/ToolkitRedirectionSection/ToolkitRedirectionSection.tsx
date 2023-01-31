import {ReactElement} from "react";
import {styles} from "./styles/ToolkitRedirectionSection.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import { ExternalRoutes } from "../../../utils/navigation";

const ChevronRightBlue = '/assets/images/chevron-right-blue.png';
const RedirectArrowBlue = '/assets/images/redirect-arrow-blue.png';
const CenterBlueBg = '/assets/images/redirection-center-blue.png';
const TopRightBg = '/assets/images/redirection-top-right-orange.png';
const BottomBlueBg = '/assets/images/redirection-bottom-blue.png';
const LeftBlueBg = '/assets/images/redirection-left-blue.png';
const SmallRedirectBg1 = '/assets/images/small-redirect-shape-1.png'
const SmallRedirectBg2 = '/assets/images/small-redirect-shape-2.png';

const ToolkitRedirectionSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.ToolkitRedirectionSection(isSmall)}>
      {!isSmall && <img src={CenterBlueBg} alt={'center blue background'} style={styles.CenterBlueBg}/> }
      {!isSmall && <img src={TopRightBg} alt={'top right orange background'} style={styles.TopRightBg}/> }
      {!isSmall && <img src={BottomBlueBg} alt={'bottom blue background'} style={styles.BottomBlueBg}/> }
      {!isSmall && <img src={LeftBlueBg} alt={'left blue background'} style={styles.LeftBlueBg}/> }
      { isSmall && <img src={SmallRedirectBg1} alt={'left blue background'} style={styles.SmallRedirectBg1}/> }
      { isSmall && <img src={SmallRedirectBg2} alt={'left blue background'} style={styles.SmallRedirectBg2}/> }
      <div style={styles.ToolkitRedirectionSectionContent(isSmall)}>
        <div style={styles.ToolkitRedirectionColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Title(isSmall)}>For Consumers</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Test your Internet connection to ensure you're getting what you pay for.</p>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={'/broadband-testing'} className={'fw-bold'} style={styles.Link}>Test your connection</a>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={'/site-monitoring'} className={'fw-bold'} style={styles.Link}>Monitor your connectivity</a>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
        </div>
        <div style={styles.ToolkitRedirectionColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Title(isSmall)}>For Internet Providers</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Let your customers test their connectivity through a white-labeled speed test.</p>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={'/broadband-testing'} className={'fw-bold'} style={styles.Link}>Explore broadband testing</a>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={'/site-monitoring'} className={'fw-bold'} style={styles.Link}>Monitor locations' connectivity</a>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={process.env.NODE_ENV === 'production' ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING} target={'_blank'} rel={'noreferrer'} className={'fw-bold'} style={styles.Link}>Explore the map</a>
            <img src={RedirectArrowBlue} style={styles.LinkChevron} alt={'redirect-arrow-blue'}/>
          </div>
        </div>
        <div style={styles.ToolkitRedirectionColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Title(isSmall)}>For Policy Makers</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Our tools can help grant funders and applicants determine where investment makes sense.</p>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={'/broadband-testing'} className={'fw-bold'} style={styles.Link}>Explore broadband testing</a>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={'/site-monitoring'} className={'fw-bold'} style={styles.Link}>Monitor locations' connectivity</a>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <a href={process.env.NODE_ENV === 'production' ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING} target={'_blank'} rel={'noreferrer'} className={'fw-bold'} style={styles.Link}>Explore the map</a>
            <img src={RedirectArrowBlue} style={styles.LinkChevron} alt={'redirect-arrow-blue'}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolkitRedirectionSection;