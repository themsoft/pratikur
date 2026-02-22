# Pratikur

Currency tracking, converter and statistics app. Real-time exchange rates from ECB and TCMB, historical data archive, and rate statistics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-brightgreen.svg)
![JavaScript](https://img.shields.io/badge/vanilla-JavaScript-f7df1e.svg)

**Live:** [pratikur.com](https://pratikur.com)

## Features

- **Rate List** - All currency rates with ECB or TCMB data source toggle and info tooltips
- **Current Rate** - USD/TRY, EUR/TRY, GBP/TRY and EUR/USD at a glance (ECB daily close or TCMB selling rate)
- **Converter** - Quick currency conversion with persistent calculation history (TCMB shows buying/selling)
- **Historical Rates** - Date range queries from ECB or TCMB archive
- **Rate Statistics** - Monthly averages, min/max values, daily/weekly/monthly percentage changes
- **Favorites** - Pin currencies to the top section for quick access (persistent)
- **CSV Export** - Download rate lists and historical data as CSV
- **Dark Theme** - Light/dark mode toggle with persistent preference
- **Multi-language** - Turkish and English (TR/EN) with persistent preference
- **PWA** - Installable as a mobile/desktop app with offline support

## Quick Start

```bash
# Clone the repository
git clone https://github.com/themsoft/pratikur.git
cd pratikur

# Install Netlify CLI (required for TCMB proxy)
npm install -g netlify-cli

# Run locally
netlify dev --port 8888
```

Open [http://localhost:8888](http://localhost:8888) in your browser.

> **Note:** The TCMB data source requires the Netlify Functions proxy. Without `netlify dev`, only ECB rates will be available.

## Tech Stack

- **Vanilla JavaScript** - No framework, module-like file separation
- **[Frankfurter API](https://frankfurter.dev)** - ECB exchange rates (mid-rate)
- **[TCMB](https://www.tcmb.gov.tr)** - Central Bank of Turkey rates via Netlify Functions proxy (bid/ask)
- **CSS Custom Properties** - Theming with ~45 design tokens (light/dark)
- **[Outfit](https://fonts.google.com/specimen/Outfit) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** - Typography
- **Service Worker** - PWA with network-first caching strategy
- **Netlify** - Hosting and serverless functions

## Project Structure

```
pratikur/
  index.html                  Main app page
  privacy.html                Privacy policy (multi-language, dark mode)
  sw.js                       Service worker (cache: pratikur-v5)
  site.webmanifest             PWA manifest
  css/
    style.css                 Styles, CSS variables, dark theme, responsive
  js/
    utils.js                  Helpers (formatting, fetch retry, CSV export)
    i18n.js                   Translation system (TR/EN, ~110 keys)
    tcmb.js                   TCMB data operations
    stats.js                  Rate statistics engine + rendering
    app.js                    Main orchestrator
  netlify/functions/
    tcmb-proxy.js             TCMB XML to JSON proxy
  assets/                     Favicons and PWA icons
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
