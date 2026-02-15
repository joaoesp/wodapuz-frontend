# Wodapuz Frontend

[![CI](https://github.com/joaoesp/wodapuz-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/joaoesp/wodapuz-frontend/actions/workflows/ci.yml)

An interactive world map visualization application built with React 19 and TypeScript, displaying economic indicators from the World Bank API.

## Features

- 🗺️ Interactive world map with pan and zoom controls
- 📊 Six economic indicators:
  - GDP
  - GDP growth
  - GDP per capita
  - Debt-to-GDP ratio
  - Inflation
  - Current Account Balance (% of GDP)
- ⏱️ Historical data timeline (1960-2024)
- 🎨 Metric-specific color scales for data visualization
- 📱 Responsive design

## Tech Stack

- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **react-simple-maps** - Map visualization
- **ESLint 9** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Type-check and build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/
│   ├── BottomBar.tsx      # Category selection buttons
│   ├── MetricButtons.tsx  # Metric selection buttons
│   ├── TimelineSlider.tsx # Year selection slider
│   ├── TopBanner.tsx      # Category display banner
│   └── WorldMap.tsx       # Main map component
├── services/
│   └── worldBankService.ts # API service for World Bank data
├── utils/
│   └── countryNameToCode.ts # Country name to ISO-3 code mapping
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Backend

This frontend works with the [Wodapuz Backend](https://github.com/joaoesp/wodapuz-backend) - a Strapi CMS that proxies World Bank API requests with caching.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Commit your changes
5. Push and create a pull request

## License

MIT
