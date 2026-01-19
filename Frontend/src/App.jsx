import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Clients } from './pages/Clients';
import { ClientSelection } from './pages/ClientSelection';
import { CreatePostPage } from './pages/CreatePost';
import { AIAgent } from './pages/AIAgent';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
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
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/select-client" element={<ClientSelection />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/create-post-page" element={<CreatePostPage />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
