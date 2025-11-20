# Milkman Diary App

A modern web application for milkmen to manage daily milk deliveries, track customers, and generate monthly reports. Built with React, TypeScript, and Tailwind CSS.

## Features

### Customer Management
- Add, edit, and delete customers
- Set default quantities and prices per customer
- Store contact information (phone, address)
- View customer cards with quick stats

### Daily Diary
- Record daily milk deliveries for each customer
- Navigate between dates with intuitive date picker
- Mark deliveries as delivered/not delivered
- Add notes for special instructions
- Auto-calculate amounts based on quantity and price
- View daily totals

### Dashboard
- Overview of key metrics (total customers, monthly revenue, quantity, deliveries)
- Today's delivery summary
- Recent delivery history
- Quick action buttons

### Monthly Reports
- View comprehensive monthly summaries
- Per-customer breakdown with delivery counts and totals
- Navigate between months easily
- Export reports to CSV
- Print-friendly layout

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd milkman-diary-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Usage Guide

### 1. Add Customers
1. Navigate to the **Customers** page
2. Click **Add Customer**
3. Enter customer details:
   - Name (required)
   - Default quantity in liters (required)
   - Price per liter (required)
   - Phone and address (optional)
4. Click **Add Customer**

### 2. Record Daily Deliveries
1. Go to the **Diary** page
2. Select the date for the delivery
3. Click **Add Delivery**
4. Choose the customer from the dropdown
5. Adjust quantity if different from default
6. Add notes if needed
7. Mark as delivered or not delivered
8. Submit the entry

### 3. View Reports
1. Navigate to the **Reports** page
2. Select the month you want to view
3. Review the summary statistics and customer breakdown
4. Click **Export CSV** to download the report
5. Click **Print** to print the report

## Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **State Management**: React Context API
- **Data Storage**: Browser localStorage
- **Date Handling**: date-fns
- **Icons**: lucide-react

## Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ No server required
- ✅ Works offline
- ✅ Fast and responsive
- ⚠️ Data is tied to your browser and device
- ⚠️ Clearing browser data will erase all records

**Tip**: Regularly export your monthly reports as CSV backups.

## Project Structure

```
src/
├── types/          # TypeScript type definitions
├── context/        # React Context for state management
├── components/     # Reusable React components
│   ├── ui/         # Base UI components
│   └── ...         # Feature-specific components
├── pages/          # Main application pages
├── App.tsx         # App router setup
└── main.tsx        # Application entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

