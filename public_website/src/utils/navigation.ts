export const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';

export enum AppRoutes {
  HOME = '/',
  SITE_MONITORING = '/site-monitoring',
  BROADBAND_TESTING = '/broadband-testing',
  MOBILE_TESTING = '/mobile-testing',
  PRIVACY_POLICY = '/privacy-policy',
  GET_STARTED = '/get-started'
}

export const DEFAULT_MAIL_TO = 'mailto:support@radartoolkit.com';

export enum ExternalRoutes {
  MAPPING_APP_PROD = 'https://broadbandmapping.com',
  MAPPING_APP_STAGING = 'https://mapping.staging.exactlylabs.com',
  SPEEDTEST_APP_PROD = 'https://speed.radartoolkit.com',
  SPEEDTEST_APP_STAGING = 'https://speedtest-staging.exactlylabs.com',
}

export const goToUrl = (url: string, anotherTab = false) => {
  if(anotherTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
}

export const goToHome = () => goToUrl(AppRoutes.HOME);

export const widgetCssUrl = isProduction ? `${ExternalRoutes.SPEEDTEST_APP_PROD}/widget.css` : `${ExternalRoutes.SPEEDTEST_APP_STAGING}/widget.css`;
export const widgetJsUrl = isProduction ? `${ExternalRoutes.SPEEDTEST_APP_PROD}/widget.js` : `${ExternalRoutes.SPEEDTEST_APP_STAGING}/widget.js`;