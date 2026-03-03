import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCarrito } from '../context/CarritoContext'
import { supabase } from '../supabaseClient'

export default function Checkout() {
    const navigate = useNavigate()
    const { carrito, sucursalId, total, quitarDelCarrito, actualizarCantidad, vaciarCarrito } = useCarrito()
    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        correo: '',
        direccion: '',
        notas: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const moneda = carrito[0]?.moneda ?? 'USD'
    const simbolo = carrito[0]?.simbolo ?? '$'

    const formatPrecio = (precio) => {
        if (moneda === 'COP') {
            return `${simbolo} ${new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(precio)}`
        }
        return `${simbolo} ${Number(precio).toFixed(2)}`
    }

    const handleConfirmar = async () => {
        setError(null)
        if (!form.nombre) return setError('Ingresa tu nombre.')
        if (!form.telefono) return setError('Ingresa tu teléfono.')
        if (!form.correo) return setError('Ingresa tu correo.')
        if (!form.direccion) return setError('Ingresa tu dirección.')
        if (carrito.length === 0) return setError('Tu carrito está vacío.')

        setLoading(true)

        try {
            // 1. Buscar o crear cliente
            let clienteId = null
            const { data: clienteExistente } = await supabase
                .from('clientes')
                .select('id')
                .eq('correo', form.correo)
                .single()

            if (clienteExistente) {
                clienteId = clienteExistente.id
            } else {
                const { data: nuevoCliente, error: errorCliente } = await supabase
                    .from('clientes')
                    .insert({
                        nombre: form.nombre,
                        correo: form.correo,
                        telefono: form.telefono,
                        direccion: form.direccion,
                    })
                    .select()
                    .single()

                if (errorCliente) throw errorCliente
                clienteId = nuevoCliente.id
            }

            // 2. Obtener tipo de pago "pendiente" o crear uno
            let { data: tipoPago } = await supabase
                .from('tipo_pago')
                .select('id')
                .eq('nombre', 'pendiente')
                .single()

            if (!tipoPago) {
                const { data: nuevoTipo } = await supabase
                    .from('tipo_pago')
                    .insert({ nombre: 'pendiente' })
                    .select()
                    .single()
                tipoPago = nuevoTipo
            }

            // 3. Crear venta
            const { data: venta, error: errorVenta } = await supabase
                .from('ventas')
                .insert({
                    clientes_id: clienteId,
                    sucursales_id: sucursalId || carrito[0]?.sucursalId || null,
                    tipo_pago_id: tipoPago.id,
                    notas: form.notas || null,
                    origen: 'ecommerce',
                })
                .select()
                .single()

            if (errorVenta) throw errorVenta

            // 4. Crear detalle de venta
            const detalle = carrito.map(item => ({
                ventas_id: venta.id,
                productos_id: item.id,
                cantidad: item.cantidad,
            }))

            const { error: errorDetalle } = await supabase
                .from('ventas_detalle')
                .insert(detalle)

            if (errorDetalle) throw errorDetalle

            // 5. Descontar inventario
            for (const item of carrito) {
                await supabase.rpc('descontar_inventario', {
                    p_producto_id: item.id,
                    p_sucursal_id: sucursalId || item.sucursalId,
                    p_cantidad: item.cantidad,
                })
            }

            vaciarCarrito()
            navigate(`/confirmacion?venta=${venta.id}`)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10 flex-1 w-full">
                <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition">
                    <ArrowLeft className="w-4 h-4" />
                    Seguir comprando
                </Link>

                <h2 className="text-2xl font-bold text-gray-900 mb-8">Tu carrito</h2>

                {carrito.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Tu carrito está vacío.</p>
                        <Link to="/" className="mt-4 inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-medium hover:bg-yellow-300 transition">
                            Ver productos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Productos */}
                        <div className="md:col-span-2 flex flex-col gap-4">
                            {carrito.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4 items-center">
                                    <div className="bg-gray-100 rounded-lg w-20 h-20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.imagen_url ? (
                                            <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingCart className="w-8 h-8 text-gray-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-800 text-sm truncate">{item.nombre}</h3>
                                        <p className="text-gray-400 text-xs mt-0.5">{item.codigo}</p>
                                        <p className="font-bold text-gray-900 mt-1">{formatPrecio(item.precio)}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition text-sm"
                                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                            >
                                                −
                                            </button>
                                            <span className="px-3 py-1 text-sm font-medium border-x border-gray-200">
                        {item.cantidad}
                      </span>
                                            <button
                                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition text-sm"
                                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className="text-red-400 hover:text-red-600 transition p-1"
                                            onClick={() => quitarDelCarrito(item.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumen y formulario */}
                        <div className="flex flex-col gap-4">
                            {/* Resumen */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Resumen</h3>
                                <div className="flex flex-col gap-2 text-sm">
                                    {carrito.map(item => (
                                        <div key={item.id} className="flex justify-between text-gray-600">
                                            <span className="truncate mr-2">{item.nombre} x{item.cantidad}</span>
                                            <span className="whitespace-nowrap">{formatPrecio(item.precio * item.cantidad)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>{formatPrecio(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Formulario */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Tus datos</h3>
                                <div className="flex flex-col gap-3">
                                    <input
                                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        name="nombre"
                                        placeholder="Nombre completo *"
                                        value={form.nombre}
                                        onChange={handleChange}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        name="correo"
                                        placeholder="Correo electrónico *"
                                        type="email"
                                        value={form.correo}
                                        onChange={handleChange}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        name="telefono"
                                        placeholder="Teléfono *"
                                        value={form.telefono}
                                        onChange={handleChange}
                                    />
                                    <input
                                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        name="direccion"
                                        placeholder="Dirección de entrega *"
                                        value={form.direccion}
                                        onChange={handleChange}
                                    />
                                    <textarea
                                        className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                                        name="notas"
                                        placeholder="Notas adicionales (opcional)"
                                        rows={3}
                                        value={form.notas}
                                        onChange={handleChange}
                                    />

                                    {error && <p className="text-red-500 text-xs">{error}</p>}

                                    <button
                                        className={`w-full py-3 rounded-xl font-medium text-sm transition ${
                                            loading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                                        }`}
                                        onClick={handleConfirmar}
                                        disabled={loading}
                                    >
                                        {loading ? 'Procesando...' : 'Confirmar pedido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}