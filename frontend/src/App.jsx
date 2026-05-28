import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OnboardingTour from './components/OnboardingTour';
import ProtectedRoute from './components/ProtectedRoute';
import { applyUiSettings } from './utils/uiSettings';
import './index.css';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Library = lazy(() => import('./pages/Library'));
const Support = lazy(() => import('./pages/Support'));
const UploadBook = lazy(() => import('./pages/UploadBook'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Favorites = lazy(() => import('./pages/Favorites'));
const WriterDashboard = lazy(() => import('./pages/WriterDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const MoodLab = lazy(() => import('./pages/MoodLab'));
const Catalog = lazy(() => import('./pages/Catalog'));
const BookReader = lazy(() => import('./pages/BookReader'));

function AppRoutes() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    const key = `onboarding_seen_${user._id}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [user]);

  const finishOnboarding = () => {
    if (user?._id) localStorage.setItem(`onboarding_seen_${user._id}`, "1");
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && <OnboardingTour onFinish={finishOnboarding} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/library" element={<Library />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route
          path="/mood-lab"
          element={
            <ProtectedRoute>
              <MoodLab />
            </ProtectedRoute>
          }
        />
        <Route path="/support" element={<Support />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route
          path="/read/:id"
          element={
            <ProtectedRoute>
              <BookReader />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute roles={["writer", "admin"]}>
              <UploadBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/writer-dashboard"
          element={
            <ProtectedRoute roles={["writer", "admin"]}>
              <WriterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => {
    const raw = localStorage.getItem("ui_settings");
    const defaultSettings = { theme: "dark", glassmorphism: true, reduceMotion: false };
    if (!raw) {
      localStorage.setItem("ui_settings", JSON.stringify(defaultSettings));
      applyUiSettings(defaultSettings);
      return;
    }
    try {
      const settings = JSON.parse(raw);
      applyUiSettings(settings);
    } catch {
      applyUiSettings(defaultSettings);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<div className="p-6 text-center">Loading premium experience...</div>}>
              <AppRoutes />
            </Suspense>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;