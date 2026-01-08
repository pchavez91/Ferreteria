'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, Empresa } from '@/lib/types'
import { ShoppingCart, Plus, Trash2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CajaPage() {
  const [carrito, setCarrito] = useState<Array<{ producto: Producto; cantidad: number }>>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'tarjeta' | 'factura'>('efectivo')
  const [empresaId, setEmpresaId] = useState('')
  const [descuento, setDescuento] = useState('0')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadProductos()
    loadEmpresas()
  }, [])

  const loadProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .gt('stock', 0)
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('activa', true)
        .order('nombre')

      if (error) throw error
      setEmpresas(data || [])
    } catch (error) {
      console.error('Error al cargar empresas:', error)
    }
  }

  const agregarAlCarrito = (producto: Producto) => {
    const existe = carrito.find((item) => item.producto.id === producto.id)
    if (existe) {
      if (existe.cantidad < producto.stock) {
        setCarrito(
          carrito.map((item) =>
            item.producto.id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        )
      }
    } else {
      setCarrito([...carrito, { producto, cantidad: 1 }])
    }
  }

  const quitarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId))
  }

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    const item = carrito.find((item) => item.producto.id === productoId)
    if (item && cantidad > 0 && cantidad <= item.producto.stock) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === productoId ? { ...item, cantidad } : item
        )
      )
    }
  }

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => {
      const precio = item.cantidad >= item.producto.cantidad_minima_mayor
        ? item.producto.precio_mayor
        : item.producto.precio_unitario
      return sum + precio * item.cantidad
    }, 0)
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const desc = parseFloat(descuento) || 0
    return Math.max(0, subtotal - desc)
  }

  const generarNumeroFactura = () => {
    const timestamp = Date.now()
    return `FAC-${timestamp.toString().slice(-8)}`
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío')
      return
    }

    if (tipoPago === 'factura' && !empresaId) {
      alert('Debe seleccionar una empresa para factura')
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuario no autenticado')

      const subtotal = calcularSubtotal()
      const desc = parseFloat(descuento) || 0
      const impuesto = 0 // Puedes agregar cálculo de impuestos
      const total = calcularTotal()

      // Crear venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            numero_factura: generarNumeroFactura(),
            empresa_id: tipoPago === 'factura' ? empresaId : null,
            usuario_id: user.id,
            tipo_pago: tipoPago,
            subtotal,
            descuento: desc,
            impuesto,
            total,
            estado: 'completada',
          },
        ])
        .select()
        .single()

      if (ventaError) throw ventaError

      // Crear detalles de venta y actualizar stock
      const detalles = carrito.map((item) => {
        const precio = item.cantidad >= item.producto.cantidad_minima_mayor
          ? item.producto.precio_mayor
          : item.producto.precio_unitario

        return {
          venta_id: venta.id,
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: precio,
          descuento: 0,
          subtotal: precio * item.cantidad,
        }
      })

      const { error: detallesError } = await supabase
        .from('detalle_ventas')
        .insert(detalles)

      if (detallesError) throw detallesError

      // Actualizar stock de productos
      for (const item of carrito) {
        const nuevoStock = item.producto.stock - item.cantidad
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id', item.producto.id)

        // Registrar movimiento de bodega
        await supabase.from('movimientos_bodega').insert([
          {
            producto_id: item.producto.id,
            tipo: 'salida',
            cantidad: item.cantidad,
            motivo: `Venta ${venta.numero_factura}`,
            usuario_id: user.id,
          },
        ])
      }

      alert(`Venta procesada exitosamente. Factura: ${venta.numero_factura}`)
      setCarrito([])
      setDescuento('0')
      setTipoPago('efectivo')
      setEmpresaId('')
      loadProductos()
    } catch (error: any) {
      console.error('Error al procesar venta:', error)
      alert(error.message || 'Error al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panel de Productos */}
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Punto de Venta</h1>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {productosFiltrados.map((producto) => (
              <button
                key={producto.id}
                onClick={() => agregarAlCarrito(producto)}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-left"
              >
                <div className="font-semibold text-sm mb-1">{producto.nombre}</div>
                <div className="text-xs text-gray-500 mb-2">
                  Stock: {producto.stock} {producto.unidad_medida}
                </div>
                <div className="text-lg font-bold text-primary-600">
                  ${Number(producto.precio_unitario).toLocaleString()}
                </div>
                {producto.precio_mayor !== producto.precio_unitario && (
                  <div className="text-xs text-gray-500">
                    Mayor: ${Number(producto.precio_mayor).toLocaleString()}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel de Carrito */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Carrito
          </h2>

          {carrito.length === 0 ? (
            <p className="text-gray-500 text-center py-8">El carrito está vacío</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {carrito.map((item) => {
                  const precio = item.cantidad >= item.producto.cantidad_minima_mayor
                    ? item.producto.precio_mayor
                    : item.producto.precio_unitario
                  return (
                    <div key={item.producto.id} className="border-b pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.producto.nombre}</div>
                          <div className="text-xs text-gray-500">
                            ${Number(precio).toLocaleString()} c/u
                          </div>
                        </div>
                        <button
                          onClick={() => quitarDelCarrito(item.producto.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarCantidad(item.producto.id, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center border rounded"
                          min="1"
                          max={item.producto.stock}
                        />
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                          className="w-6 h-6 flex items-center justify-center border rounded"
                        >
                          +
                        </button>
                        <span className="ml-auto font-semibold">
                          ${(precio * item.cantidad).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${calcularSubtotal().toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descuento:
                  </label>
                  <input
                    type="number"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${calcularTotal().toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago:
                  </label>
                  <select
                    value={tipoPago}
                    onChange={(e) => {
                      setTipoPago(e.target.value as any)
                      if (e.target.value !== 'factura') setEmpresaId('')
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="factura">Factura</option>
                  </select>
                </div>

                {tipoPago === 'factura' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa:
                    </label>
                    <select
                      value={empresaId}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">Seleccionar empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nombre} - {empresa.nit}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={procesarVenta}
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 'Procesar Venta'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
