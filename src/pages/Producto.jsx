import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useProductos } from '../hooks/useProductos'
import { useCarrito } from '../context/CarritoContext'

export default function Producto() {
    const { id } = useParams()
    const { fetchProducto, sucursales } = useProductos()
    const { agregarAlCarrito, sucursalId, setSucursalId } = useCarrito()
    const [producto, setProducto] = useState(null)
    const [loading, setLoading] = useState(true)
    const [cantidad, setCantidad] = useState(1)
    const [agregado, setAgregado] = useState(false)

    useEffect(() => {
        fetchProducto(id).then(data => {
            setProducto(data)
            setLoading(false)
        })
    }, [id])

    const sucursalActual = sucursales.find(s => s.id === sucursalId)
    const moneda = sucursalActual?.moneda ?? 'USD'
    const simbolo = sucursalActual?.simbolo ?? '$'

    const stockSucursal = sucursalId
        ? producto?.inventario?.find(i => i.sucursales_id === sucursalId)?.cantidad ?? 0
        : producto?.inventario?.reduce((acc, i) => acc + i.cantidad, 0) ?? 0

    const formatPrecio = (precio) => {
        if (moneda === 'COP') {
            return `${simbolo} ${new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(precio)}`
        }
        return `${simbolo} ${Number(precio).toFixed(2)}`
    }

    const handleAgregar = () => {
        agregarAlCarrito({ ...producto, moneda, simbolo, sucursalId }, cantidad)
        setAgregado(true)
        setTimeout(() => setAgregado(false), 2000)
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">Cargando producto...</p>
            </div>
        </div>
    )

    if (!producto) return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-gray-400 text-lg">Producto no encontrado.</p>
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                    Volver a la tienda
                </Link>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">

                {/* Breadcrumb */}
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a la tienda
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* Imagen */}
                    // Reemplaza el div de la imagen placeholder por esto:
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                        {producto.imagen_url ? (
                            <img
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                Sin imagen
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-6">
                        {producto.categorias && (
                            <span className="text-sm text-yellow-600 font-medium">
                                {producto.categorias.nombre}
                            </span>
                        )}

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>
                            <p className="text-gray-400 text-sm mt-1">Código: {producto.codigo}</p>
                        </div>

                        {producto.descripcion && (
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {producto.descripcion}
                            </p>
                        )}

                        {/* Selector de sucursal */}
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Selecciona tu ubicación</p>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border-2 transition ${
                                        sucursalId === ''
                                            ? 'border-yellow-400 bg-yellow-50 text-gray-900'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                    onClick={() => setSucursalId('')}
                                >
                                    🌎 Todos
                                </button>
                                {sucursales.map(s => (
                                    <button
                                        key={s.id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border-2 transition ${
                                            sucursalId === s.id
                                                ? 'border-yellow-400 bg-yellow-50 text-gray-900'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSucursalId(s.id)}
                                    >
                                        {s.moneda === 'USD' ? '🇪🇨' : '🇨🇴'} {s.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Precio y stock */}
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Precio</span>
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatPrecio(producto.precio)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Stock disponible</span>
                                <span className={`font-medium text-sm ${
                                    stockSucursal === 0 ? 'text-red-500' :
                                        stockSucursal <= 5 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {stockSucursal === 0 ? 'Agotado' : `${stockSucursal} unidades`}
                                </span>
                            </div>
                        </div>

                        {/* Cantidad y botón */}
                        {stockSucursal > 0 && (
                            <div className="flex gap-3 items-center">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                                    >
                                        −
                                    </button>
                                    <span className="px-4 py-2 font-medium text-gray-800 border-x border-gray-300">
                                        {cantidad}
                                    </span>
                                    <button
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition"
                                        onClick={() => setCantidad(Math.min(stockSucursal, cantidad + 1))}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition ${
                                        agregado
                                            ? 'bg-green-500 text-white'
                                            : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                    }`}
                                    onClick={handleAgregar}
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {agregado ? '✓ Agregado al carrito' : 'Agregar al carrito'}
                                </button>
                            </div>
                        )}

                        {stockSucursal === 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <p className="text-red-600 font-medium text-sm">
                                    Producto agotado en esta ubicación
                                </p>
                                <p className="text-red-400 text-xs mt-1">
                                    Intenta seleccionar otra sucursal
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}