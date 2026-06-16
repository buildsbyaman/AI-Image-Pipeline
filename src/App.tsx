import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Otp from "./pages/Otp"
import Dashboard from "./pages/Dashboard"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public routes only accessible when NOT logged in */}
          <Route element={<ProtectedRoute requireAuth={false} />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp" element={<Otp />} />
          </Route>

          {/* Protected routes only accessible when logged in */}
          <Route element={<ProtectedRoute requireAuth={true} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Default fallback redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
  )
}

export default App
