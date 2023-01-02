import {ReactElement} from "react";
import {styles} from "./styles/ToolkitRedirectionSection.style";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const ChevronRightBlue = '/assets/images/chevron-right-blue.png';
const RedirectArrowBlue = '/assets/images/redirect-arrow-blue.png';

const ToolkitRedirectionSection = (): ReactElement => {

  const {isSmallScreen, isMidScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isMidScreen;

  return (
    <div style={styles.ToolkitRedirectionSection(isSmall)}>
      <div style={styles.ToolkitRedirectionSectionContent(isSmall)}>
        <div style={styles.ToolkitRedirectionColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Title(isSmall)}>For Consumers</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Test your internet connection to ensure you’re getting what you’re paying for.</p>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Test your connection</p>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Monitor your connectivity</p>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
        </div>
        <div style={styles.ToolkitRedirectionColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Title(isSmall)}>For Internet Providers</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>See how your service actually does and let your customers test their connectivity.</p>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Explore broadband testing</p>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Monitor sites’ connectivity</p>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Explore the map</p>
            <img src={RedirectArrowBlue} style={styles.LinkChevron} alt={'redirect-arrow-blue'}/>
          </div>
        </div>
        <div style={styles.ToolkitRedirectionColumn(isSmall)}>
          <p className={'fw-bold'} style={styles.Title(isSmall)}>For Policy Makers</p>
          <p className={'fw-medium'} style={styles.Subtitle(isSmall)}>Our tools can help grant funders and applicants figure out where investment makes sense.</p>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Explore broadband testing</p>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Monitor sites’ connectivity</p>
            <img src={ChevronRightBlue} style={styles.LinkChevron} alt={'chevron-right-blue'}/>
          </div>
          <div className={'hover-opaque'} style={styles.LinkContainer(isSmall)}>
            <p className={'fw-bold'} style={styles.Link}>Explore the map</p>
            <img src={RedirectArrowBlue} style={styles.LinkChevron} alt={'redirect-arrow-blue'}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolkitRedirectionSection;