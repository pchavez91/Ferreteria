'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Producto, Empresa } from '@/lib/types'
import { 
  Search, Trash2, ShoppingCart, Plus, Building2, 
  CreditCard, Banknote, Receipt, X, Package,
  ChevronLeft, ChevronRight, Minus
} from 'lucide-react'
import EmpresaModal from '@/components/EmpresaModal'

export default function POSPage() {
  const router = useRouter()
  const [carrito, setCarrito] = useState<Array<{ producto: Producto; cantidad: number }>>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'tarjeta' | 'factura' | null>(null)
  const [empresaId, setEmpresaId] = useState('')
  const [descuento, setDescuento] = useState('0')
  const [loading, setLoading] = useState(false)
  const [showEmpresaModal, setShowEmpresaModal] = useState(false)
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [montoEfectivo, setMontoEfectivo] = useState('')
  const [numeroTarjeta, setNumeroTarjeta] = useState('')
  const [nombreTarjeta, setNombreTarjeta] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [cvv, setCvv] = useState('')
  const [cuotas, setCuotas] = useState('1')
  const [tipoTarjeta, setTipoTarjeta] = useState<'debito' | 'credito'>('debito')
  const carritoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
    loadProductos()
    loadEmpresas()
  }, [])

  useEffect(() => {
    // Scroll automático al agregar productos
    if (carritoRef.current && carrito.length > 0) {
      const lastItem = carritoRef.current.lastElementChild as HTMLElement
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [carrito])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!usuario || (usuario.rol !== 'caja' && usuario.rol !== 'admin')) {
      router.push('/dashboard')
    }
  }

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

  const handleSeleccionarPago = (tipo: 'efectivo' | 'tarjeta' | 'factura') => {
    setTipoPago(tipo)
    if (tipo === 'factura' && empresas.length === 0) {
      loadEmpresas()
    }
    if (tipo !== 'factura') {
      setShowPagoModal(true)
    }
  }

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío')
      return
    }

    if (tipoPago === null) {
      alert('Debe seleccionar un método de pago')
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
            notas: tipoPago === 'efectivo' 
              ? `Efectivo recibido: ${formatearPeso(parseFloat(montoEfectivo) || total)}`
              : tipoPago === 'tarjeta'
              ? `Tarjeta ${tipoTarjeta} - Cuotas: ${cuotas}`
              : null,
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

      // Actualizar stock y crear movimientos
      for (const item of carrito) {
        const nuevoStock = item.producto.stock - item.cantidad
        await supabase
          .from('productos')
          .update({ stock: nuevoStock })
          .eq('id', item.producto.id)

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

      alert(`✓ Venta procesada exitosamente\nFactura: ${venta.numero_factura}\nTotal: ${formatearPeso(total)}`)
      
      // Limpiar
      setCarrito([])
      setDescuento('0')
      setTipoPago(null)
      setEmpresaId('')
      setMontoEfectivo('')
      setNumeroTarjeta('')
      setNombreTarjeta('')
      setFechaVencimiento('')
      setCvv('')
      setCuotas('1')
      setShowPagoModal(false)
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Punto de Venta (POS)</h1>
            <p className="text-sm text-muted-foreground">Sistema de ventas - Ferretería</p>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-foreground transition-colors hover-lift"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Panel de Productos - Lado Izquierdo */}
        <div className="col-span-12 lg:col-span-7 flex flex-col bg-card rounded-xl border border-border shadow-xl overflow-hidden">
          {/* Buscador */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar producto por nombre o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto p-4">
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-lg">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => agregarAlCarrito(producto)}
                    className="card-interactive p-4 bg-accent/30 border border-border rounded-xl text-left hover:bg-accent/50 group"
                  >
                    <div className="font-semibold text-sm mb-2 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {producto.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Stock: {producto.stock} {producto.unidad_medida}
                    </div>
                    <div className="text-lg font-bold text-primary mb-1">
                      {formatearPeso(Number(producto.precio_unitario))}
                    </div>
                    {producto.precio_mayor !== producto.precio_unitario && (
                      <div className="text-xs text-muted-foreground">
                        Mayor: {formatearPeso(Number(producto.precio_mayor))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel de Carrito y Pago - Lado Derecho */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          {/* Carrito */}
          <div className="flex-1 bg-card rounded-xl border border-border shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Carrito de Compras
                {carrito.length > 0 && (
                  <span className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    {carrito.length}
                  </span>
                )}
              </h2>
            </div>

            <div ref={carritoRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingCart className="w-24 h-24 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Carrito vacío</p>
                  <p className="text-sm mt-2">Agrega productos desde el catálogo</p>
                </div>
              ) : (
                carrito.map((item) => {
                  const precio = item.cantidad >= item.producto.cantidad_minima_mayor
                    ? item.producto.precio_mayor
                    : item.producto.precio_unitario
                  const subtotalItem = precio * item.cantidad
                  return (
                    <div
                      key={item.producto.id}
                      className="bg-accent/30 border border-border rounded-xl p-4 animate-fadeIn hover:bg-accent/50 transition-all hover-lift"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground mb-1 truncate">
                            {item.producto.nombre}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Precio: {formatearPeso(precio)} c/u
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.producto.unidad_medida} • Stock: {item.producto.stock}
                          </div>
                        </div>
                        <button
                          onClick={() => quitarDelCarrito(item.producto.id)}
                          className="ml-3 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) =>
                            actualizarCantidad(item.producto.id, parseInt(e.target.value) || 1)
                          }
                          className="w-16 text-center bg-input border border-border rounded-lg text-foreground font-semibold"
                          min="1"
                          max={item.producto.stock}
                        />
                        <button
                          onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-border rounded-lg hover:bg-accent transition-colors text-foreground"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="ml-auto font-bold text-lg text-primary">
                          {formatearPeso(subtotalItem)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Totales */}
            {carrito.length > 0 && (
              <div className="border-t border-border p-4 bg-accent/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold text-foreground">{formatearPeso(calcularSubtotal())}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Descuento (CLP):
                  </label>
                  <input
                    type="number"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
                    min="0"
                    step="1"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (19%):</span>
                  <span className="font-semibold text-foreground">{formatearPeso(calcularIVA())}</span>
                </div>

                <div className="flex justify-between text-xl font-bold border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Total a Pagar:</span>
                  <span className="text-primary">{formatearPeso(calcularTotal())}</span>
                </div>
              </div>
            )}
          </div>

          {/* Métodos de Pago */}
          {carrito.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-xl p-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Método de Pago</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => handleSeleccionarPago('efectivo')}
                  className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                    tipoPago === 'efectivo'
                      ? 'border-primary bg-primary/20 shadow-lg scale-105'
                      : 'border-border bg-accent/30 hover:border-primary/50'
                  }`}
                >
                  <Banknote className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium text-foreground">Efectivo</div>
                </button>

                <button
                  onClick={() => handleSeleccionarPago('tarjeta')}
                  className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                    tipoPago === 'tarjeta'
                      ? 'border-primary bg-primary/20 shadow-lg scale-105'
                      : 'border-border bg-accent/30 hover:border-primary/50'
                  }`}
                >
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium text-foreground">Tarjeta</div>
                </button>

                <button
                  onClick={() => handleSeleccionarPago('factura')}
                  className={`p-4 rounded-xl border-2 transition-all hover-lift ${
                    tipoPago === 'factura'
                      ? 'border-primary bg-primary/20 shadow-lg scale-105'
                      : 'border-border bg-accent/30 hover:border-primary/50'
                  }`}
                >
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium text-foreground">Factura</div>
                </button>
              </div>

              {tipoPago === 'factura' && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-foreground">Empresa:</label>
                    <button
                      type="button"
                      onClick={() => setShowEmpresaModal(true)}
                      className="text-xs text-primary hover:text-primary-400 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Nueva
                    </button>
                  </div>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground"
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
                onClick={() => {
                  if (tipoPago === null) {
                    alert('Seleccione un método de pago')
                    return
                  }
                  if (tipoPago === 'factura' && !empresaId) {
                    alert('Seleccione una empresa')
                    return
                  }
                  if (tipoPago === 'efectivo' || tipoPago === 'tarjeta') {
                    setShowPagoModal(true)
                  } else {
                    procesarVenta()
                  }
                }}
                disabled={loading || tipoPago === null || (tipoPago === 'factura' && !empresaId)}
                className="w-full mt-4 bg-gradient-to-r from-primary to-primary-600 text-primary-foreground py-4 rounded-xl font-bold text-lg hover-glow hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pago */}
      {showPagoModal && tipoPago && (
        <PagoModal
          tipo={tipoPago}
          total={calcularTotal()}
          montoEfectivo={montoEfectivo}
          setMontoEfectivo={setMontoEfectivo}
          numeroTarjeta={numeroTarjeta}
          setNumeroTarjeta={setNumeroTarjeta}
          nombreTarjeta={nombreTarjeta}
          setNombreTarjeta={setNombreTarjeta}
          fechaVencimiento={fechaVencimiento}
          setFechaVencimiento={setFechaVencimiento}
          cvv={cvv}
          setCvv={setCvv}
          cuotas={cuotas}
          setCuotas={setCuotas}
          tipoTarjeta={tipoTarjeta}
          setTipoTarjeta={setTipoTarjeta}
          onClose={() => setShowPagoModal(false)}
          onConfirm={procesarVenta}
          loading={loading}
          formatearPeso={formatearPeso}
        />
      )}

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

// Componente Modal de Pago
function PagoModal({
  tipo,
  total,
  montoEfectivo,
  setMontoEfectivo,
  numeroTarjeta,
  setNumeroTarjeta,
  nombreTarjeta,
  setNombreTarjeta,
  fechaVencimiento,
  setFechaVencimiento,
  cvv,
  setCvv,
  cuotas,
  setCuotas,
  tipoTarjeta,
  setTipoTarjeta,
  onClose,
  onConfirm,
  loading,
  formatearPeso,
}: any) {
  const vuelto = tipo === 'efectivo' && montoEfectivo ? parseFloat(montoEfectivo) - total : 0

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-md w-full border border-border shadow-2xl animate-fadeIn">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            {tipo === 'efectivo' ? 'Pago en Efectivo' : 'Pago con Tarjeta'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
            <div className="text-sm text-muted-foreground mb-1">Total a Pagar</div>
            <div className="text-2xl font-bold text-primary">{formatearPeso(total)}</div>
          </div>

          {tipo === 'efectivo' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Monto Recibido (CLP) *
                </label>
                <input
                  type="number"
                  value={montoEfectivo}
                  onChange={(e) => setMontoEfectivo(e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground text-lg font-semibold"
                  placeholder="0"
                  min={total}
                  step="1"
                  autoFocus
                />
              </div>
              {vuelto > 0 && (
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-sm text-muted-foreground mb-1">Vuelto</div>
                  <div className="text-xl font-bold text-green-400">{formatearPeso(vuelto)}</div>
                </div>
              )}
              {vuelto < 0 && montoEfectivo && (
                <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                  <div className="text-sm text-red-400">Monto insuficiente. Faltan: {formatearPeso(Math.abs(vuelto))}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Tarjeta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTipoTarjeta('debito')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tipoTarjeta === 'debito'
                        ? 'border-primary bg-primary/20'
                        : 'border-border bg-input'
                    }`}
                  >
                    Débito
                  </button>
                  <button
                    onClick={() => setTipoTarjeta('credito')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tipoTarjeta === 'credito'
                        ? 'border-primary bg-primary/20'
                        : 'border-border bg-input'
                    }`}
                  >
                    Crédito
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Número de Tarjeta *
                </label>
                <input
                  type="text"
                  value={numeroTarjeta}
                  onChange={(e) => setNumeroTarjeta(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del Titular *
                </label>
                <input
                  type="text"
                  value={nombreTarjeta}
                  onChange={(e) => setNombreTarjeta(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                  placeholder="NOMBRE APELLIDO"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vencimiento (MM/AA) *
                  </label>
                  <input
                    type="text"
                    value={fechaVencimiento}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4)
                      }
                      setFechaVencimiento(value)
                    }}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                    placeholder="12/25"
                    maxLength={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    CVV *
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>

              {tipoTarjeta === 'credito' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cuotas
                  </label>
                  <select
                    value={cuotas}
                    onChange={(e) => setCuotas(e.target.value)}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground"
                  >
                    {[1, 2, 3, 6, 12, 18, 24].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'cuota' : 'cuotas'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={
                loading ||
                (tipo === 'efectivo' && (!montoEfectivo || parseFloat(montoEfectivo) < total)) ||
                (tipo === 'tarjeta' && (!numeroTarjeta || !nombreTarjeta || !fechaVencimiento || !cvv))
              }
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors font-semibold"
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
