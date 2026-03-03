import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useProductos() {
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [sucursales, setSucursales] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSucursales()
    }, [])

    async function fetchSucursales() {
        const { data } = await supabase
            .from('sucursales')
            .select('id, nombre, moneda, simbolo')
        if (data) setSucursales(data)
    }

    async function fetchProductos(sucursalId) {
        setLoading(true)

        let query = supabase
            .from('productos')
            .select(`
        id,
        nombre,
        codigo,
        precio,
        descripcion,
        imagen_url,
        categorias(id, nombre),
        inventario(cantidad, sucursales_id)
      `)
            .order('nombre')

        const { data, error } = await query

        if (!error && data) {
            // Filtrar por sucursal y stock disponible
            const filtrados = sucursalId
                ? data.filter(p =>
                    p.inventario?.some(i =>
                        i.sucursales_id === sucursalId && i.cantidad > 0
                    )
                )
                : data.filter(p =>
                    p.inventario?.some(i => i.cantidad > 0)
                )

            setProductos(filtrados)

            const cats = filtrados
                .map(p => p.categorias)
                .filter(Boolean)
                .filter((cat, index, self) =>
                    index === self.findIndex(c => c.id === cat.id)
                )
            setCategorias(cats)
        }

        setLoading(false)
    }

    async function fetchProducto(id) {
        const { data, error } = await supabase
            .from('productos')
            .select(`
        id,
        nombre,
        codigo,
        precio,
        descripcion,
        imagen_url,
        categorias(id, nombre),
        inventario(cantidad, sucursales_id)
      `)
            .eq('id', id)
            .single()

        if (error) return null
        return data
    }

    return { productos, categorias, sucursales, loading, fetchProductos, fetchProducto }
}