import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import OrdersListPage from './pages/OrdersListPage'
import NewOrderPage from './pages/NewOrderPage'
import OrderDetailPage from './pages/OrderDetailPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-light">
        <Navbar />
        <Routes>
          <Route path="/" element={<OrdersListPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/clients" element={<ClientsPage />} />
         <Route path="/clients/:id" element={<ClientDetailPage />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}
