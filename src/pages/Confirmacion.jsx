import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'

export default function Confirmacion() {
    const [searchParams] = useSearchParams()
    const ventaId = searchParams.get('venta')
    const [venta, setVenta] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (ventaId) fetchVenta()
    }, [ventaId])

    async function fetchVenta() {
        const { data } = await supabase
            .from('ventas')
            .select(`
        id,
        created_at,
        notas,
        clientes(nombre, correo, telefono, direccion),
        sucursales(nombre),
        ventas_detalle(
          cantidad,
          productos(nombre, codigo, precio, imagen_url)
        )
      `)
            .eq('id', ventaId)
            .single()

        if (data) setVenta(data)
        setLoading(false)
    }

    const total = venta?.ventas_detalle?.reduce(
        (acc, d) => acc + d.productos?.precio * d.cantidad, 0
    ) ?? 0

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-10 flex-1 w-full">
                {loading ? (
                    <p className="text-gray-400 text-center">Cargando...</p>
                ) : !venta ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400">No se encontró el pedido.</p>
                        <Link to="/" className="text-blue-600 hover:underline text-sm mt-4 block">
                            Volver a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">

                        {/* Header */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                ¡Pedido confirmado!
                            </h1>
                            <p className="text-gray-500 text-sm">
                                Gracias {venta.clientes?.nombre}, tu pedido ha sido recibido.
                            </p>
                            <p className="text-gray-400 text-xs mt-2">
                                Número de pedido: <span className="font-medium text-gray-600">{venta.id.slice(0, 8).toUpperCase()}</span>
                            </p>
                        </div>

                        {/* Productos */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h2 className="font-bold text-gray-800">Detalle del pedido</h2>
                            </div>
                            <div className="flex flex-col gap-3">
                                {venta.ventas_detalle?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 rounded-lg w-10 h-10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {item.productos?.imagen_url ? (
                                                    <img
                                                        src={item.productos.imagen_url}
                                                        alt={item.productos.nombre}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{item.productos?.nombre}</p>
                                                <p className="text-gray-400 text-xs">x{item.cantidad}</p>
                                            </div>
                                        </div>
                                        <span className="font-medium text-gray-800">
                      ${(item.productos?.precio * item.cantidad).toFixed(2)}
                    </span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Datos del cliente */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Datos de entrega</h2>
                            <div className="flex flex-col gap-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Nombre</span>
                                    <span>{venta.clientes?.nombre}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Correo</span>
                                    <span>{venta.clientes?.correo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Teléfono</span>
                                    <span>{venta.clientes?.telefono}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Dirección</span>
                                    <span className="text-right max-w-xs">{venta.clientes?.direccion}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Sucursal</span>
                                    <span>{venta.sucursales?.nombre ?? '—'}</span>
                                </div>
                                {venta.notas && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Notas</span>
                                        <span className="text-right max-w-xs">{venta.notas}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Fecha</span>
                                    <span>{new Date(venta.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-3">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                                <p className="text-yellow-800 text-sm font-medium">
                                    📞 Nos pondremos en contacto contigo pronto para coordinar la entrega.
                                </p>
                            </div>
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver a la tienda
                            </Link>
                        </div>

                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}