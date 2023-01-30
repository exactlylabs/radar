export enum AppRoutes {
  HOME = '/',
  SITE_MONITORING = '/site-monitoring',
  BROADBAND_TESTING = '/broadband-testing',
  MOBILE_TESTING = '/mobile-testing',
  PRIVACY_POLICY = '/privacy-policy'
}

export const DEFAULT_MAIL_TO = 'mailto:support@radartoolkit.com';

export enum ExternalRoutes {
  SPEED_TEST_PROD = 'https://speedtest.exactlylabs.com',
  SPEED_TEST_STAGING = 'https://speedtest-staging.exactlylabs.com',
  MAPPING_APP_PROD = 'https://broadbandmapping.com',
  MAPPING_APP_STAGING = 'https://mapping.staging.exactlylabs.com',
}

export const goToUrl = (url: string, anotherTab = false) => {
  if(anotherTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
}

export const goToHome = () => goToUrl(AppRoutes.HOME);
export const goToSiteMonitoring = () => goToUrl(AppRoutes.SITE_MONITORING);
export const goToBroadbandTesting = () => goToUrl(AppRoutes.BROADBAND_TESTING);
export const goToMobile = () => goToUrl(AppRoutes.MOBILE_TESTING);
export const goToSpeedTestWebsite = () => goToUrl(process.env.NODE_ENV === 'production' ? ExternalRoutes.SPEED_TEST_PROD : ExternalRoutes.SPEED_TEST_STAGING, true);
export const goToMappingApp = () => goToUrl(process.env.NODE_ENV === 'production' ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING, true);
export const emailContact = () => { window.open(DEFAULT_MAIL_TO); }