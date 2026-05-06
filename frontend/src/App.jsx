import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './components/ConfirmModal'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import BookingPage from './pages/BookingPage'
import MyReservations from './pages/MyReservations'
import Dashboard from './pages/admin/Dashboard'
import ManageReservations from './pages/admin/ManageReservations'
import ManageSlots from './pages/admin/ManageSlots'
import ManageServices from './pages/admin/ManageServices'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/book/:serviceId" element={
                  <ProtectedRoute><BookingPage /></ProtectedRoute>
                } />
                <Route path="/reservations" element={
                  <ProtectedRoute><MyReservations /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly><Navigate to="/admin/dashboard" replace /></ProtectedRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>
                } />
                <Route path="/admin/reservations" element={
                  <ProtectedRoute adminOnly><ManageReservations /></ProtectedRoute>
                } />
                <Route path="/admin/slots" element={
                  <ProtectedRoute adminOnly><ManageSlots /></ProtectedRoute>
                } />
                <Route path="/admin/services" element={
                  <ProtectedRoute adminOnly><ManageServices /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  )
}

