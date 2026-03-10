import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState([])
    const [sucursalId, setSucursalId] = useState(null)
    const [sucursales, setSucursales] = useState([])

    useEffect(() => {
        async function fetchSucursales() {
            const { data, error } = await supabase
                .from('sucursales')
                .select('*')

            console.log('sucursales:', data, error) // para debug
            if (data) setSucursales(data)
        }
        fetchSucursales()
    }, [])

    function agregarAlCarrito(producto, cantidad = 1) {
        const existente = carrito.find(i => i.id === producto.id)
        if (existente) {
            setCarrito(carrito.map(i =>
                i.id === producto.id
                    ? { ...i, cantidad: i.cantidad + cantidad }
                    : i
            ))
        } else {
            setCarrito([...carrito, { ...producto, cantidad }])
        }
    }

    function quitarDelCarrito(id) {
        setCarrito(carrito.filter(i => i.id !== id))
    }

    function actualizarCantidad(id, cantidad) {
        if (cantidad <= 0) return quitarDelCarrito(id)
        setCarrito(carrito.map(i => i.id === id ? { ...i, cantidad } : i))
    }

    function vaciarCarrito() {
        setCarrito([])
        setSucursalId(null)
    }

    const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0)

    return (
        <CarritoContext.Provider value={{
            carrito,
            sucursalId,
            setSucursalId,
            sucursales,
            agregarAlCarrito,
            quitarDelCarrito,
            actualizarCantidad,
            vaciarCarrito,
            total,
            totalItems
        }}>
            {children}
        </CarritoContext.Provider>
    )
}

export function useCarrito() {
    return useContext(CarritoContext)
}
