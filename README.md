# Personify Health Automation

A Playwright script for automating interactions with the Personify Health web application and automatically gathering available points.

## Setup

### Prerequisites
- Node.js installed on your system

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Configure your credentials:
   - Copy `.env` file and update with your credentials:
     ```env
     USERNAME=your-email@example.com
     PASSWORD=your-password
     ```

## Usage

Run the automation script:
```bash
npm start
```

The script will:
1. Launch a browser window (visible for debugging)
2. Log into Personify Health
3. Navigate through pages and click buttons to gather points

## Customization

Edit `main.js` to modify the button clicking logic. The script includes helper functions:

- `safeClick(selector, description, skipWait)` - Safely clicks elements with error handling
- `elementExists(selector)` - Checks if an element exists without waiting

## Troubleshooting

- If elements aren't found, the browser will stay open for inspection
- Screenshots are saved on errors:
  - `error-screenshot.png` - When errors occur

## Notes

- The script runs in headful mode (visible browser) for easier debugging
- Slow motion is enabled to better see the automation in action
- Modify selectors in `main.js` if the web interface changes
