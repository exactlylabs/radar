import {CSSProperties} from "react";

const siteMonitoringPageStyle: CSSProperties = {
  width: '100vw'
}

const siteMonitoringPageContentStyle: CSSProperties = {
  width: 'calc(100% - 50px)',
  maxWidth: '1300px',
  margin: '0 auto',
}


export const styles = {
  SiteMonitoringPage: siteMonitoringPageStyle,
  SiteMonitoringPageContent: siteMonitoringPageContentStyle
}