import {useRouter} from "next/router";

export enum AppRoutes {
  BASE = '/',
  HOME = '/home',
  SITE_MONITORING = '/site-monitoring',
  BROADBAND_TESTING = '/broadband-testing',
  MOBILE = '/mobile',
  PRIVACY_POLICY = '/privacy-policy'
}

export enum ExternalRoutes {
  SPEED_TEST_PROD = 'https://speedtest.exactlylabs.com',
  SPEED_TEST_STAGING = 'https://speedtest-staging.exactlylabs.com',
  MAPPING_APP_PROD = 'https://broadbandmapping.com',
  MAPPING_APP_STAGING = 'https://mapping.staging.exactlylabs.com',
}

export const goToUrl = (url: string) => window.location.href = url;

export const goToBase = () => goToUrl(AppRoutes.BASE);
export const goToHome = () => goToUrl(AppRoutes.HOME);
export const goToSiteMonitoring = () => goToUrl(AppRoutes.SITE_MONITORING);
export const goToBroadbandTesting = () => goToUrl(AppRoutes.BROADBAND_TESTING);
export const goToMobile = () => goToUrl(AppRoutes.MOBILE);
export const goToSpeedTestWebsite = () => goToUrl(process.env.NODE_ENV === 'production' ? ExternalRoutes.SPEED_TEST_PROD : ExternalRoutes.SPEED_TEST_STAGING);
export const goToMappingApp = () => goToUrl(process.env.NODE_ENV === 'production' ? ExternalRoutes.MAPPING_APP_PROD : ExternalRoutes.MAPPING_APP_STAGING);