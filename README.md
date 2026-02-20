# Pratikur

Currency tracking, converter and statistics app. Real-time exchange rates from ECB and TCMB, historical data archive, and rate statistics.

**Live:** [pratikur.com](https://pratikur.com)

## Features

- **Rate List** - All currency rates with ECB or TCMB data source toggle
- **Current Rate** - USD/TRY and EUR/TRY at a glance (ECB daily close or TCMB buying/selling)
- **Converter** - Quick currency conversion with persistent calculation history
- **Historical Rates** - Date range queries from ECB or TCMB archive
- **Rate Statistics** - Monthly averages, min/max values, daily/weekly/monthly percentage changes
- **CSV Export** - Download rate lists and historical data as CSV
- **Multi-language** - Turkish and English (TR/EN) with persistent preference
- **PWA** - Installable as a mobile/desktop app with offline support

## Tech

- Vanilla JavaScript (no framework)
- [Frankfurter API](https://frankfurter.dev) (ECB exchange rates)
- [TCMB](https://www.tcmb.gov.tr) (Central Bank of Turkey rates via Netlify Functions proxy)
- i18n system with `data-i18n` attributes
- Service Worker (PWA, network-first with cache fallback)
- Hosted on Netlify

## Project Structure

```
pratikur/
  index.html                  Main app page
  privacy.html                Privacy policy (multi-language)
  css/style.css               All styles + responsive breakpoints
  js/
    utils.js                  Helpers (formatla, fetchWithRetry, csvIndir)
    i18n.js                   Translation system (TR/EN, ~100 keys)
    tcmb.js                   TCMB data operations
    stats.js                  Rate statistics engine + rendering
    app.js                    Main orchestrator
  sw.js                       Service worker
  netlify.toml                Netlify config
  netlify/functions/
    tcmb-proxy.js             TCMB XML to JSON proxy
```
