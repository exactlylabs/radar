import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DESTINATION_BASE_URL = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://pods.radartoolkit.com' : 'https://pods.staging.radartoolkit.com'

export function middleware(request: NextRequest) {
  const tbpMatcher = /(T|t){1}(B|b){1}(P|p){1}/;
  if (tbpMatcher.test(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/TBP?origin=toolkit', DESTINATION_BASE_URL));
  }
  return NextResponse.next();
}