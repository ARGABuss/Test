import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import OrdersListPage from './pages/OrdersListPage'
import NewOrderPage from './pages/NewOrderPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-light">
        <Navbar />
        <Routes>
          <Route path="/" element={<OrdersListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
