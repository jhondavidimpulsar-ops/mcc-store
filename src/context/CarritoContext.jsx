import { createContext, useContext, useState } from 'react'

const CarritoContext = createContext()

export function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState([])
    const [sucursalId, setSucursalId] = useState('')

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
    }

    const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0)

    return (
        <CarritoContext.Provider value={{
            carrito,
            sucursalId,
            setSucursalId,
            agregarAlCarrito,
            quitarDelCarrito,
            actualizarCantidad,
            vaciarCarrito,
            total,
            totalItems,
        }}>
            {children}
        </CarritoContext.Provider>
    )
}

export function useCarrito() {
    return useContext(CarritoContext)
}