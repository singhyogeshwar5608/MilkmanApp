import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SplashScreen } from './components/SplashScreen';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const Layout = lazy(() => import('./components/Layout').then(module => ({ default: module.Layout })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Customers = lazy(() => import('./pages/Customers').then(module => ({ default: module.Customers })));
const Diary = lazy(() => import('./pages/Diary').then(module => ({ default: module.Diary })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail').then(module => ({ default: module.CustomerDetail })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));

const AppRoutes = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<SplashScreen />}>
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="customers" element={<Customers />} />
                <Route path="customers/:id" element={<CustomerDetail />} />
                <Route path="diary" element={<Diary />} />
                <Route path="reports" element={<Reports />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<Admin />} />
            </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
