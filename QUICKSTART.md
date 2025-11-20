# Quick Start Guide

## First Time Setup

1. **Install dependencies**
   ```powershell
   npm install
   ```

2. **Start the development server**
   ```powershell
   npm run dev
   ```

3. **Open your browser**
   - Navigate to http://localhost:5173
   - The app is ready to use!

## First Steps in the App

### 1. Add Your First Customer
- Click on **Customers** in the navigation
- Click **Add Customer** button
- Fill in:
  - Customer name (e.g., "Ramesh Kumar")
  - Default quantity (e.g., 2 liters)
  - Price per liter (e.g., ₹60)
  - Phone and address (optional)
- Click **Add Customer**

### 2. Record Today's Deliveries
- Click on **Diary** in the navigation
- Make sure today's date is selected
- Click **Add Delivery**
- Select your customer from the dropdown
- The quantity will auto-fill with the default
- Adjust if needed
- Click **Add Delivery**

### 3. View Your Dashboard
- Click on **Dashboard** in the navigation
- See your business metrics:
  - Total customers
  - Monthly revenue
  - Monthly quantity sold
  - Number of deliveries
- View recent deliveries and today's summary

### 4. Generate Monthly Reports
- Click on **Reports** in the navigation
- Select the month you want to view
- See detailed breakdown by customer
- Click **Export CSV** to download
- Click **Print** to print the report

## Tips

- **Data is stored locally**: All your data is saved in your browser's localStorage
- **Works offline**: No internet connection required after initial load
- **Backup your data**: Export monthly reports as CSV regularly
- **Keyboard shortcuts**: Use Tab to navigate through forms quickly
- **Mobile friendly**: The app is responsive and works on mobile devices

## Troubleshooting

**Issue**: App won't start
- **Solution**: Make sure Node.js is installed and run `npm install`

**Issue**: Lost my data
- **Solution**: Data is stored in browser localStorage. Clearing browser data will erase records. Use CSV exports as backups.

**Issue**: Can't see my customers in delivery form
- **Solution**: Make sure you've added customers first from the Customers page

## Building for Production

When ready to deploy:

```powershell
# Build the production version
npm run build

# The built files will be in the 'dist' folder
# You can deploy this folder to any static hosting service
```

Preview the production build:

```powershell
npm run preview
```

## Need Help?

- Check the full README.md for detailed documentation
- Review WARP.md for technical architecture details
