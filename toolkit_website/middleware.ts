import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DESTINATION_BASE_URL = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://pods.radartoolkit.com' : 'http://0.0.0.0:3000'

const MATCHERS = {
  TBP: /tbp/i,
  GO_ALASKA: {
    URL: /go-alaska/i,
    NAME: 'Alaska',
    SOURCE: 'canvasList',
    DATE: '04292024'
  },
  GO_MICHIGAN: {
    URL: /go-michigan/i,
    NAME: 'Michigan',
    SOURCE: 'canvasList',
    DATE: '04292024'
  },
  GO_TEXAS: {
    URL: /go-texas/i,
    NAME: 'Texas',
    SOURCE: 'canvasList',
    DATE: '04292024'
  },
  GO_WEST_VIRGINIA: {
    URL:/go-westvirginia/i,
    NAME: 'WestVirginia',
    SOURCE: 'canvasList',
    DATE: '04292024'
  }
};

export function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const queryParams = new URLSearchParams(request.nextUrl.search)
  queryParams.append('origin','toolkit');
  let nextUrl;
  if (MATCHERS.TBP.test(pathName)) {
    nextUrl = '/TBP?origin=toolkit';
  } else if (MATCHERS.GO_ALASKA.URL.test(pathName)) {
    nextUrl = '/GO';
    queryParams.append('state',MATCHERS.GO_ALASKA.NAME);
    setSourceAndDateForCampaing(queryParams, MATCHERS.GO_ALASKA.SOURCE, MATCHERS.GO_ALASKA.DATE);
  } else if (MATCHERS.GO_MICHIGAN.URL.test(pathName)) {
    nextUrl = '/GO';
    queryParams.append('state',MATCHERS.GO_MICHIGAN.NAME);
    setSourceAndDateForCampaing(queryParams, MATCHERS.GO_MICHIGAN.SOURCE, MATCHERS.GO_MICHIGAN.DATE);
  } else if (MATCHERS.GO_TEXAS.URL.test(pathName)) {
    nextUrl = '/GO';
    queryParams.append('state',MATCHERS.GO_TEXAS.NAME);
    setSourceAndDateForCampaing(queryParams, MATCHERS.GO_TEXAS.SOURCE, MATCHERS.GO_TEXAS.DATE);
  } else if (MATCHERS.GO_WEST_VIRGINIA.URL.test(pathName)) {
    nextUrl = '/GO';
    queryParams.append('state',MATCHERS.GO_WEST_VIRGINIA.NAME);
    setSourceAndDateForCampaing(queryParams, MATCHERS.GO_WEST_VIRGINIA.SOURCE, MATCHERS.GO_WEST_VIRGINIA.DATE);
  }

  if (nextUrl != null && nextUrl != undefined) {
    const url = new URL(DESTINATION_BASE_URL + nextUrl);
    const newUrl = url.origin + url.pathname + '?' + queryParams.toString();
    console.log(newUrl);
    return NextResponse.redirect(newUrl);
  } else {
    return NextResponse.next();
  }
}

function setSourceAndDateForCampaing(queryParams: URLSearchParams, source: string, date: string) {
  if(!queryParams.has('source')) {
    queryParams.append('source',source);
  }
  if(!queryParams.has('date')) {
    queryParams.append('date',date);
  }
}
