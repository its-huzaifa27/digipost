import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Header } from './components/Header';

import { ProtectedRoute } from './components/auth/ProtectedRoute';

import './App.css'

function App() {

  return (
    <Routes>
      <Route path="/" element={
        <>
          <Header />
          <LandingPage />
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/clients" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/create-post" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/ai-agent" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/analytics" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
      </Route>
    </Routes>
  )
}

export default App
