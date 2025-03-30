import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChatbotBuilder from './pages/ChatbotBuilder';
import { Leads } from './pages/Leads';
import { Analytics } from './pages/Analytics';
import { CodeSnippet } from './pages/CodeSnippet';
import Navbar from './components/Navbar';
import { Profile } from './pages/Profile';
import { TrialBanner } from './components/TrialBanner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthProvider } from './lib/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FeatureGuard } from './components/FeatureGuard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-dark-900">
                <Navbar />
                <main className="ml-20 transition-all duration-300 p-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/builder" element={
                      <FeatureGuard feature="builder">
                        <div className="-m-8 mt-0">
                          <ChatbotBuilder />
                        </div>
                      </FeatureGuard>
                    } />
                    <Route path="/leads" element={
                      <FeatureGuard feature="leads">
                        <Leads />
                      </FeatureGuard>
                    } />
                    <Route path="/analytics" element={
                      <FeatureGuard feature="analytics">
                        <Analytics />
                      </FeatureGuard>
                    } />
                    <Route path="/code" element={
                      <FeatureGuard feature="code">
                        <CodeSnippet />
                      </FeatureGuard>
                    } />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
