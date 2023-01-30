import '../src/styles/fonts.css';
import '../src/styles/resets.css';
import '../src/styles/index.css';
import '../src/components/MobilePage/MobilePageCarrousel/SmallMobilePageCarrousel/SmallMobilePageCarrousel.css';
import '../src/components/HomePage/InternetInvestmentSection/styles/InternetInvestmentSection.css';
import '../src/components/Frame/Navbar/RegularNavbarContent/ToolkitFloatingMenu/LeftSideToolkitTabs/ToolkitTabOption/styles/ToolkitTabOption.css';

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}