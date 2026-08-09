import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Analytics from './pages/dashboard/Analytics'
import Transactions from './pages/dashboard/Transactions'
import AIPage from './pages/dashboard/AIPage'
import DataPage from './pages/dashboard/DataPage'
import Settings from './pages/dashboard/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="ai" element={<AIPage />} />
        <Route path="data" element={<DataPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
