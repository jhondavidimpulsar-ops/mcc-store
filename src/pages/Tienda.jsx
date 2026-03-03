import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingCart, SlidersHorizontal, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useProductos } from '../hooks/useProductos'
import { useCarrito } from '../context/CarritoContext'

export default function Tienda() {
    const { productos, categorias, sucursales, loading, fetchProductos } = useProductos()
    const { agregarAlCarrito, sucursalId, setSucursalId } = useCarrito()
    const [busqueda, setBusqueda] = useState('')
    const [categoriaFiltro, setCategoriaFiltro] = useState('')
    const [agregado, setAgregado] = useState(null)

    const sucursalActual = sucursales.find(s => s.id === sucursalId)
    const moneda = sucursalActual?.moneda ?? 'USD'
    const simbolo = sucursalActual?.simbolo ?? '$'

    useEffect(() => {
        fetchProductos(sucursalId)
    }, [sucursalId])

    const formatPrecio = (precio) => {
        if (moneda === 'COP') {
            return `${simbolo} ${new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(precio)}`
        }
        return `${simbolo} ${Number(precio).toFixed(2)}`
    }

    const productosFiltrados = productos.filter(p => {
        const coincideBusqueda =
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigo?.toLowerCase().includes(busqueda.toLowerCase())
        const coincideCategoria = categoriaFiltro
            ? p.categorias?.id === categoriaFiltro
            : true
        return coincideBusqueda && coincideCategoria
    })

    const handleAgregar = (e, producto) => {
        e.preventDefault()
        agregarAlCarrito({ ...producto, moneda, simbolo, sucursalId })
        setAgregado(producto.id)
        setTimeout(() => setAgregado(null), 1500)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Selector de país */}
            {/* Selector de país */}
            <div className="bg-yellow-400">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-900">
                            <MapPin className="w-5 h-5" />
                            <span className="text-sm font-bold">¿Desde dónde compras?</span>
                        </div>
                        <div className="flex gap-3 flex-wrap justify-center">
                            <button
                                className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition border-2 ${
                                    sucursalId === ''
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border-transparent'
                                }`}
                                onClick={() => setSucursalId('')}
                            >
                                <span className="text-2xl">🌎</span>
                                <div className="text-left">
                                    <p className="font-bold">Todos</p>
                                    <p className="text-xs opacity-70">Ver todo el catálogo</p>
                                </div>
                            </button>

                            {sucursales.map(s => (
                                <button
                                    key={s.id}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition border-2 ${
                                        sucursalId === s.id
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-transparent'
                                    }`}
                                    onClick={() => setSucursalId(s.id)}
                                >
                                    <span className="text-3xl">
                                      {s.moneda === 'USD' ? '🇪🇨' : '🇨🇴'}
                                    </span>
                                    <div className="text-left">
                                        <p className="font-bold">{s.nombre}</p>
                                        <p className="text-xs opacity-70">Precios en {s.moneda}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {sucursalActual && (
                            <div className="md:ml-auto flex items-center gap-2 bg-white rounded-lg px-4 py-2">
                                  <span className="text-3xl">
                                    {sucursalActual.moneda === 'USD' ? '🇪🇨' : '🇨🇴'}
                                  </span>
                                <div>
                                    <p className="text-xs text-gray-500">Comprando desde</p>
                                    <p className="text-sm font-bold text-gray-800">{sucursalActual.nombre}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero */}
            <div className="bg-gray-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Herramientas de <span className="text-yellow-400">calidad</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        Todo lo que necesitas para tu trabajo, en un solo lugar.
                    </p>
                    <div className="max-w-xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            className="w-full bg-white text-gray-800 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Buscar herramientas..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">

                {/* Filtros por categoría */}
                {categorias.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-8" id="categorias">
                        <button
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                categoriaFiltro === ''
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                            }`}
                            onClick={() => setCategoriaFiltro('')}
                        >
                            Todos
                        </button>
                        {categorias.map(cat => (
                            <button
                                key={cat.id}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    categoriaFiltro === cat.id
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                                }`}
                                onClick={() => setCategoriaFiltro(cat.id)}
                            >
                                {cat.nombre}
                            </button>
                        ))}
                    </div>
                )}

                {/* Resultados */}
                <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-500 text-sm">
                        {loading ? '...' : `${productosFiltrados.length} productos`}
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span>Filtros</span>
                    </div>
                </div>

                {/* Grid de productos */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                                <div className="bg-gray-200 h-48 rounded-t-xl" />
                                <div className="p-4 flex flex-col gap-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : productosFiltrados.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No se encontraron productos.</p>
                        <button
                            className="mt-4 text-blue-600 hover:underline text-sm"
                            onClick={() => { setBusqueda(''); setCategoriaFiltro('') }}
                        >
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {productosFiltrados.map(producto => (
                            <Link
                                key={producto.id}
                                to={`/producto/${producto.id}`}
                                className="bg-white rounded-xl shadow-sm hover:shadow-md transition group overflow-hidden"
                            >
                                <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                                    {producto.imagen_url ? (
                                        <img
                                            src={producto.imagen_url}
                                            alt={producto.nombre}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-300">
                                            <ShoppingCart className="w-10 h-10" />
                                            <span className="text-xs">Sin imagen</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    {producto.categorias && (
                                        <span className="text-xs text-yellow-600 font-medium">
                      {producto.categorias.nombre}
                    </span>
                                    )}
                                    <h3 className="font-medium text-gray-800 text-sm mt-1 line-clamp-2">
                                        {producto.nombre}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">{producto.codigo}</p>

                                    <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-gray-900">
                      {formatPrecio(producto.precio)}
                    </span>
                                        <button
                                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                                                agregado === producto.id
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                            }`}
                                            onClick={(e) => handleAgregar(e, producto)}
                                        >
                                            {agregado === producto.id ? '✓ Agregado' : '+ Agregar'}
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}