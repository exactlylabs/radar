# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based internet speed test widget that can be embedded on third-party websites. It uses the NDT7 protocol for speed testing and provides both standalone and embeddable widget modes.

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run start        # Start dev server on port 9999
```

### Building
```bash
npm run build        # Create production build (uses NODE_ENV env variable)
```

### Testing & Code Quality
```bash
npm test             # Run tests using react-scripts
npm run prettier     # Check code formatting
```

### Docker & Deployment
```bash
make build           # Build Docker image for multiple platforms
make push-staging    # Build and push to staging registry
make deploy-staging  # Deploy to staging environment
make push            # Build and push to production registry
make deploy          # Deploy to production environment
```

## Architecture Overview

### Context-Based State Management
The application uses React Context API for state management with multiple specialized contexts wrapped in `src/App.jsx`:

- **ConfigContext**: Widget configuration (clientId, elementId, frameStyle, global mode)
- **ViewportContext**: Responsive design and viewport size management
- **ConnectionContext**: Network connection status and type detection
- **UserDataContext**: User session and metadata management
- **SpeedTestContext**: NDT7 speed test state and results
- **AlertsContext**: Application-wide alert/notification system
- **FiltersContext**: Result filtering and display preferences

### Component Structure
- **MainPage**: Primary container component that manages navigation between different views
- **StepsPage**: Multi-step speed test flow
- **OverviewPage**: Speed test results visualization
- **HistoryPage**: Historical test results display
- **AllResultsPage**: Comprehensive results view with filtering
- **Frame**: Widget wrapper component for embedded mode

### NDT7 Speed Testing
The speed test functionality (`src/utils/ndt7Tester.js`) uses M-Lab's NDT7 JavaScript client. The implementation requires:
- `ndt7-download-worker.min.js` and `ndt7-upload-worker.min.js` from the @m-lab/ndt7 package
- WebWorkers for non-blocking speed test execution
- Real-time progress updates during testing

### Widget Integration
The widget system (`src/widget/`) provides environment-specific configurations:
- **widget.dev.js**: Local development configuration
- **widget.staging.js**: Staging environment configuration
- **widget.prod.js**: Production environment configuration

Widget initialization requires:
```javascript
RadarSpeedWidget.config({
  clientId: 'provided-client-id',  // Required: Provided by ExactlyLabs
  elementId: 'root',                // Required: DOM element ID
  frameStyle: {                     // Optional: Custom styles
    width: '500px',
    height: '500px'
  },
  global: false                     // Optional: Global mode flag
});
RadarSpeedWidget.new().mount();
```

### Build System
The project uses Webpack 5 with environment-specific configurations:
- **webpack.common.js**: Shared configuration for all environments
- **webpack.dev.js**: Development server configuration
- **webpack.staging.js**: Staging build configuration
- **webpack.prod.js**: Production build optimizations

Key build features:
- Babel transpilation for JSX and ES6+
- CSS extraction with MiniCssExtractPlugin
- Asset handling for fonts, images, and manifests
- Content hashing for cache busting
- Code splitting and optimization with TerserPlugin

### API Integration
The application communicates with the Radar Toolkit API (`https://pods.radartoolkit.com`) for:
- Storing test results
- Retrieving historical data
- Client authentication via clientId
- Sentry error reporting tunnel

### Responsive Design
The application uses Material-UI with custom breakpoint hooks in `src/hooks/`:
- **useIsXSSizeScreen**: Mobile devices
- **useIsSmallSizeScreen**: Tablets
- **useIsMediumSizeScreen**: Small desktops
- **useIsLargeSizeScreen**: Standard desktops
- **useIsXLSizeScreen**: Large displays

## Environment Variables
The build system uses the following environment variables:
- `NODE_ENV`: Build environment (dev/staging/production)
- `REACT_APP_ENV`: Runtime environment for Sentry
- `REACT_APP_SENTRY_DSN`: Sentry error reporting DSN