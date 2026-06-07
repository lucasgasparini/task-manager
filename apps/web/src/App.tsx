import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { useAuthStore } from './store/auth.ts'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
