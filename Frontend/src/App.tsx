import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import Upload from "./pages/Upload"
import JobDetails from "./pages/JobDetails"
import { AuthProvider } from "./context/AuthContext"
import { ToastProvider } from "./context/ToastContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes only accessible when NOT logged in */}
              <Route element={<ProtectedRoute requireAuth={false} />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>


              {/* Protected routes only accessible when logged in */}
              <Route element={<ProtectedRoute requireAuth={true} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/jobs" element={<Navigate to="/dashboard" replace />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
              </Route>

              {/* Default fallback redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
