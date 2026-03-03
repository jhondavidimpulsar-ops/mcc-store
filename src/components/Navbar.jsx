import { Link } from 'react-router-dom'
import { ShoppingCart, Wrench } from 'lucide-react'
import { useCarrito } from '../context/CarritoContext'

export default function Navbar() {
    const { totalItems } = useCarrito()

    return (
        <nav className="bg-gray-900 text-white sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-yellow-400" />
                    <span className="font-bold text-xl tracking-tight">
            MCC <span className="text-yellow-400">Tools</span>
          </span>
                </Link>

                {/* Links */}
                <div className="hidden md:flex items-center gap-8 text-sm text-gray-300">
                    <Link to="/" className="hover:text-white transition">Tienda</Link>
                    <a href="#categorias" className="hover:text-white transition">Categorías</a>
                    <a href="#contacto" className="hover:text-white transition">Contacto</a>
                </div>

                {/* Carrito */}
                <Link to="/checkout" className="relative flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-300 transition">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Carrito</span>
                    {totalItems > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalItems}
            </span>
                    )}
                </Link>

            </div>
        </nav>
    )
}