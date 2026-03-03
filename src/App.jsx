import { Routes, Route } from 'react-router-dom'
import Tienda from './pages/Tienda'
import Producto from './pages/Producto'
import Checkout from './pages/Checkout'
import Confirmacion from './pages/Confirmacion'
import { CarritoProvider } from './context/CarritoContext'

export default function App() {
    return (
        <CarritoProvider>
            <Routes>
                <Route path="/" element={<Tienda />} />
                <Route path="/producto/:id" element={<Producto />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/confirmacion" element={<Confirmacion />} />
            </Routes>
        </CarritoProvider>
    )
}