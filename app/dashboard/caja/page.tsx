'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, Empresa } from '@/lib/types'
import { ShoppingCart, Plus, Trash2, Search, Building2, Package } from 'lucide-react'
import EmpresaModal from '@/components/EmpresaModal'

export default function CajaPage() {
  const [carrito, setCarrito] = useState<Array<{ producto: Producto; cantidad: number }>>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'tarjeta' | 'factura'>('efectivo')
  const [empresaId, setEmpresaId] = useState('')
  const [descuento, setDescuento] = useState('0')
  const [loading, setLoading] = useState(false)
  const [showEmpresaModal, setShowEmpresaModal] = useState(false)

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

  const calcularIVA = () => {
    const subtotal = calcularSubtotal()
    const desc = parseFloat(descuento) || 0
    const subtotalConDescuento = Math.max(0, subtotal - desc)
    return subtotalConDescuento * 0.19
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const desc = parseFloat(descuento) || 0
    const subtotalConDescuento = Math.max(0, subtotal - desc)
    const iva = calcularIVA()
    return subtotalConDescuento + iva
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
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
      const subtotalConDescuento = Math.max(0, subtotal - desc)
      const iva = calcularIVA()
      const total = calcularTotal()

      // Crear venta
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            numero_factura: generarNumeroFactura(),
            empresa_id: tipoPago === 'factura' ? empresaId : null,
            usuario_id: user.id,
            tipo_pago: tipoPago === 'tarjeta' ? 'tarjeta' : tipoPago,
            subtotal: subtotalConDescuento,
            descuento: desc,
            impuesto: iva,
            total,
            estado: 'completada',
          },
        ])
        .select()
        .single()

      if (ventaError) {
        console.error('Error al crear venta:', ventaError)
        throw ventaError
      }

      // Crear detalles de venta
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

      if (detallesError) {
        console.error('Error al crear detalles:', detallesError)
        throw detallesError
      }

      // Actualizar stock de productos y crear movimientos
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

      alert(`Venta procesada exitosamente.\nFactura: ${venta.numero_factura}\nTotal: ${formatearPeso(total)}`)
      setCarrito([])
      setDescuento('0')
      setTipoPago('efectivo')
      setEmpresaId('')
      loadProductos()
    } catch (error: any) {
      console.error('Error al procesar venta:', error)
      alert(`Error al procesar la venta: ${error.message || 'Error desconocido'}`)
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Punto de Venta</h1>
        <p className="text-muted-foreground mb-6">Selecciona los productos para agregar al carrito</p>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar producto por nombre o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {productosFiltrados.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              productosFiltrados.map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left bg-card hover:bg-accent/30"
                >
                  <div className="font-semibold text-sm mb-2 text-foreground">{producto.nombre}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Stock disponible: {producto.stock} {producto.unidad_medida}
                  </div>
                  <div className="text-lg font-bold text-primary mb-1">
                    {formatearPeso(Number(producto.precio_unitario))}
                  </div>
                  {producto.precio_mayor !== producto.precio_unitario && (
                    <div className="text-xs text-muted-foreground">
                      Precio mayor: {formatearPeso(Number(producto.precio_mayor))} (mín. {producto.cantidad_minima_mayor})
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel de Carrito */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-xl shadow-lg border border-border p-6 sticky top-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Carrito de Compras
          </h2>

          {carrito.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">El carrito está vacío</p>
              <p className="text-sm text-muted-foreground mt-2">Agrega productos desde el catálogo</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-[350px] overflow-y-auto">
                {carrito.map((item) => {
                  const precio = item.cantidad >= item.producto.cantidad_minima_mayor
                    ? item.producto.precio_mayor
                    : item.producto.precio_unitario
                  const subtotalItem = precio * item.cantidad
                  return (
                    <div key={item.producto.id} className="border-b border-border pb-3 bg-accent/20 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-foreground mb-1">{item.producto.nombre}</div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Precio unitario: {formatearPeso(precio)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.producto.unidad_medida} • Stock: {item.producto.stock}
                          </div>
                        </div>
                        <button
                          onClick={() => quitarDelCarrito(item.producto.id)}
                          className="text-red-400 hover:text-red-300 transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarCantidad(item.producto.id, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center bg-input border border-border rounded-lg text-foreground"
                          min="1"
                          max={item.producto.stock}
                        />
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
                        >
                          +
                        </button>
                        <span className="ml-auto font-bold text-primary">
                          {formatearPeso(subtotalItem)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold text-foreground">{formatearPeso(calcularSubtotal())}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Descuento (CLP):
                  </label>
                  <input
                    type="number"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                    min="0"
                    step="1"
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (19%):</span>
                  <span className="font-semibold text-foreground">{formatearPeso(calcularIVA())}</span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                  <span className="text-foreground">Total a Pagar:</span>
                  <span className="text-primary">{formatearPeso(calcularTotal())}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Medio de Pago:
                  </label>
                  <select
                    value={tipoPago}
                    onChange={(e) => {
                      setTipoPago(e.target.value as any)
                      if (e.target.value !== 'factura') setEmpresaId('')
                    }}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta Débito/Crédito</option>
                    <option value="factura">Factura</option>
                  </select>
                </div>

                {tipoPago === 'factura' && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-foreground">
                        Empresa:
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowEmpresaModal(true)}
                        className="text-xs text-primary hover:text-primary-400 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Nueva Empresa
                      </button>
                    </div>
                    <select
                      value={empresaId}
                      onChange={(e) => setEmpresaId(e.target.value)}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
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
                  disabled={loading || (tipoPago === 'factura' && !empresaId)}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                  {loading ? 'Procesando...' : 'Procesar Venta'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showEmpresaModal && (
        <EmpresaModal
          empresa={null}
          onClose={() => {
            setShowEmpresaModal(false)
            loadEmpresas()
          }}
        />
      )}
    </div>
  )
}
