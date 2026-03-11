import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import LoginPage from './pages/LoginPage'
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AccountsPage from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import AccountDetailPage from "./pages/AccountDetailPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Protected app routes */}
          <Route 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          >
            <Route path="/dashboard" element={
              <DashboardPage />
            } />
            <Route path="/accounts" element={
              <AccountsPage />
            } />
            <Route path="/transactions" element={
              <TransactionsPage />
            } />
            <Route path="/accounts/:id" element={
              <AccountDetailPage />
            } />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App