import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Components & Pages
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Chat from './pages/Chat';
import Jobs from './pages/Jobs';
import Meet from './pages/Meet';
import Communities from './pages/Communities';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BigDataConsole from './pages/BigDataConsole';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// Layout Wrapper
const AppLayout = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col pb-16 lg:pb-0">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-4 md:px-6 py-6 max-w-6xl mx-auto w-full">
          <Routes>
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/connections" element={<ProtectedRoute><Connections /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/meet" element={<ProtectedRoute><Meet /></ProtectedRoute>} />
            <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/bigdata" element={<ProtectedRoute><BigDataConsole /></ProtectedRoute>} />

            {/* Public Landing & Authentication Routes */}
            <Route path="/landing" element={user ? <Navigate to="/" replace /> : <Landing />} />
            <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignIn />} />
            <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignUp />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to={user ? "/" : "/landing"} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <AppLayout />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
