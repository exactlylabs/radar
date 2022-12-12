export enum AppRoutes {
  BASE = '/',
  HOME = '/home',
  SITE_MONITORING = '/site-monitoring',
  BROADBAND_TESTING = '/broadband-testing'
}

export const goToUrl = (url: string) => window.location.replace(url);

export const goToBase = () => goToUrl(AppRoutes.BASE);
export const goToHome = () => goToUrl(AppRoutes.HOME);
export const goToSiteMonitoring = () => goToUrl(AppRoutes.SITE_MONITORING);
export const goToBroadbandTesting = () => goToUrl(AppRoutes.BROADBAND_TESTING);