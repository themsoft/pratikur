# Pratikur

Currency tracking and converter app. Live USD/TRY, EUR/TRY rates via Binance WebSocket, historical data from ECB (Frankfurter API).

**Live:** [pratikur.com](https://pratikur.com)

## Features

- **Live Market** - Real-time USD/TRY and EUR/TRY prices via Binance WebSocket
- **Rate List** - All currency rates against a selected base (ECB daily data)
- **Converter** - Quick currency conversion with calculation history
- **Historical Rates** - Date range queries with daily rate archive
- **CSV Export** - Download rate lists and historical data as CSV
- **PWA** - Installable as a mobile/desktop app

## Tech

- Vanilla JavaScript (no framework)
- [Frankfurter API](https://frankfurter.dev) (ECB exchange rates)
- [Binance WebSocket](https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams) (live USDT/TRY, EUR/USDT)
- Service Worker (PWA support)
- Hosted on Netlify
