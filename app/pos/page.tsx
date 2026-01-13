'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { Producto, Empresa } from '@/lib/types'
import { 
  Search, Trash2, ShoppingCart, Plus, Building2, 
  CreditCard, Banknote, Receipt, X, Package,
  ChevronLeft, ChevronRight, Minus, LogOut
} from 'lucide-react'
import EmpresaModal from '@/components/EmpresaModal'
import CierreTurnoModal from '@/components/CierreTurnoModal'
import { User } from '@/lib/types'

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
  const [showBoletaModal, setShowBoletaModal] = useState(false)
  const [ventaCompletada, setVentaCompletada] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showCierreTurnoModal, setShowCierreTurnoModal] = useState(false)
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

    // Página de caja temporalmente deshabilitada
    // Solo admin puede acceder a POS por ahora
    if (!usuario || usuario.rol !== 'admin') {
      if (usuario?.rol === 'caja') {
        // Cerrar sesión y redirigir al login con mensaje
        await supabase.auth.signOut()
        router.push('/login')
        return
      }
      router.push('/dashboard')
      return
    }

    // Actualizar sesión del usuario como activo
    const ahora = new Date().toISOString()
    const { data: sesionExistente } = await supabase
      .from('sesiones_usuarios')
      .select('hora_conexion, esta_activo')
      .eq('usuario_id', usuario.id)
      .single()

    const horaInicioSesion = sesionExistente?.esta_activo && sesionExistente?.hora_conexion 
      ? sesionExistente.hora_conexion 
      : ahora

    await supabase
      .from('sesiones_usuarios')
      .upsert({
        usuario_id: usuario.id,
        ultima_conexion: ahora,
        hora_conexion: horaInicioSesion,
        esta_activo: true,
        updated_at: ahora,
      }, {
        onConflict: 'usuario_id'
      })

    setUser(usuario)
  }

  const handleLogout = () => {
    if (user) {
      setShowCierreTurnoModal(true)
    }
  }

  const handleConfirmLogout = async () => {
    if (user) {
      await supabase
        .from('sesiones_usuarios')
        .update({ esta_activo: false, updated_at: new Date().toISOString() })
        .eq('usuario_id', user.id)
    }
    await supabase.auth.signOut()
    router.push('/login')
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
      // Error silencioso
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
      // Error silencioso
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

      // Obtener datos del usuario vendedor
      const { data: usuarioVendedor } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      // Crear venta - todos los pagos dan boleta, solo factura tiene empresa_id
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .insert([
          {
            numero_factura: generarNumeroFactura(),
            empresa_id: tipoPago === 'factura' ? empresaId : null,
            usuario_id: user.id,
            vendedor_id: user.id,
            tipo_pago: tipoPago || 'efectivo', // efectivo, tarjeta, o factura
            subtotal: subtotalConDescuento,
            descuento: desc,
            impuesto: iva,
            total,
            estado: 'completada',
            notas: tipoPago === 'efectivo' 
              ? `Efectivo recibido: ${formatearPeso(parseFloat(montoEfectivo) || total)}. Vuelto: ${formatearPeso(Math.max(0, parseFloat(montoEfectivo || '0') - total))}`
              : tipoPago === 'tarjeta'
              ? `Tarjeta ${tipoTarjeta} - Cuotas: ${cuotas} - N°: ${numeroTarjeta.slice(-4)}`
              : tipoPago === 'factura'
              ? `Factura a empresa`
              : null,
          },
        ])
        .select('*')
        .single()

      if (ventaError) {
        throw ventaError
      }

      // Obtener empresa si existe (para la boleta)
      let empresa = null
      if (venta.empresa_id) {
        const { data: empresaData } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', venta.empresa_id)
          .single()
        empresa = empresaData
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

      // Mostrar boleta - agregar empresa a la venta para mostrar en la boleta
      setVentaCompletada({
        venta: {
          ...venta,
          empresa: empresa
        },
        carrito: carrito,
        usuarioVendedor: usuarioVendedor,
        tipoPago: tipoPago || 'efectivo',
        montoEfectivo: tipoPago === 'efectivo' ? montoEfectivo : null,
        vuelto: tipoPago === 'efectivo' ? Math.max(0, parseFloat(montoEfectivo || '0') - total) : 0,
      })
      setShowBoletaModal(true)
      
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
          <button
            onClick={() => {
              if (user) {
                setShowCierreTurnoModal(true)
              } else {
                // Si no hay usuario, cerrar sesión directamente
                supabase.auth.signOut().then(() => {
                  router.push('/login')
                })
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content - 3 Columnas */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Columna 1: Buscar y Agregar Productos */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-card rounded-xl border border-border shadow-xl overflow-hidden">
          {/* Buscador */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Buscar Productos
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Nombre o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto p-4">
            {productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="w-16 h-16 mb-4 opacity-50" />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {productosFiltrados.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => agregarAlCarrito(producto)}
                    className="p-3 bg-accent/30 border border-border rounded-lg text-left hover:bg-accent/50 hover-lift transition-all group"
                  >
                    <div className="font-medium text-xs mb-1 text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {producto.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      Stock: {producto.stock}
                    </div>
                    <div className="text-sm font-bold text-primary">
                      {formatearPeso(Number(producto.precio_unitario))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          </div>

        {/* Columna 2: Carrito de Compras */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-card rounded-xl border border-border shadow-xl overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrito de Compras
              {carrito.length > 0 && (
                <span className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                  {carrito.length}
                </span>
              )}
            </h2>
          </div>

          <div ref={carritoRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">Carrito vacío</p>
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
                    className="bg-accent/30 border border-border rounded-lg p-3 hover:bg-accent/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-foreground mb-1 line-clamp-2">
                          {item.producto.nombre}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatearPeso(precio)} c/u
                        </div>
                      </div>
                      <button
                        onClick={() => quitarDelCarrito(item.producto.id)}
                        className="ml-2 p-1 text-red-400 hover:text-red-300 rounded transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-accent transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarCantidad(item.producto.id, parseInt(e.target.value) || 1)
                        }
                        className="w-12 text-center bg-input border border-border rounded text-foreground text-xs font-semibold"
                        min="1"
                        max={item.producto.stock}
                      />
                      <button
                        onClick={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-border rounded hover:bg-accent transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="ml-auto font-bold text-sm text-primary">
                        {formatearPeso(subtotalItem)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Columna 3: Totales y Métodos de Pago */}
        <div className="col-span-12 lg:col-span-4 flex flex-col bg-card rounded-xl border border-border shadow-xl overflow-hidden p-4">
            {carrito.length > 0 ? (
              <>
                {/* Totales */}
                <div className="space-y-3 border-b border-border pb-4">
                  <h2 className="text-lg font-bold text-foreground">Resumen de Venta</h2>
                  
                  <div className="space-y-2">
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

                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">{formatearPeso(calcularTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* Métodos de Pago */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-foreground mb-3">Método de Pago</h3>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      onClick={() => handleSeleccionarPago('efectivo')}
                      className={`p-3 rounded-lg border-2 transition-all hover-lift flex flex-col items-center ${
                        tipoPago === 'efectivo'
                          ? 'border-primary bg-primary/20 shadow-lg'
                          : 'border-border bg-accent/30 hover:border-primary/50'
                      }`}
                    >
                      <Banknote className="w-6 h-6 mb-1 text-primary" />
                      <div className="text-xs font-medium text-foreground">Efectivo</div>
                    </button>

                    <button
                      onClick={() => handleSeleccionarPago('tarjeta')}
                      className={`p-3 rounded-lg border-2 transition-all hover-lift flex flex-col items-center ${
                        tipoPago === 'tarjeta'
                          ? 'border-primary bg-primary/20 shadow-lg'
                          : 'border-border bg-accent/30 hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-1 text-primary" />
                      <div className="text-xs font-medium text-foreground">Tarjeta</div>
                    </button>

                    <button
                      onClick={() => handleSeleccionarPago('factura')}
                      className={`p-3 rounded-lg border-2 transition-all hover-lift flex flex-col items-center ${
                        tipoPago === 'factura'
                          ? 'border-primary bg-primary/20 shadow-lg'
                          : 'border-border bg-accent/30 hover:border-primary/50'
                      }`}
                    >
                      <Receipt className="w-6 h-6 mb-1 text-primary" />
                      <div className="text-xs font-medium text-foreground">Factura</div>
                    </button>
                  </div>

                  {tipoPago === 'factura' && (
                    <div className="mb-4 space-y-2">
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
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm"
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
                    className="w-full mt-auto bg-gradient-to-r from-primary to-primary-600 text-primary-foreground py-3 rounded-lg font-bold hover-glow hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {loading ? 'Procesando...' : 'Finalizar Venta'}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Receipt className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-sm">Agrega productos para ver el resumen</p>
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

      {showBoletaModal && ventaCompletada && (
        <BoletaModal
          venta={ventaCompletada.venta}
          carrito={ventaCompletada.carrito}
          usuarioVendedor={ventaCompletada.usuarioVendedor}
          tipoPago={ventaCompletada.tipoPago}
          montoEfectivo={ventaCompletada.montoEfectivo}
          vuelto={ventaCompletada.vuelto}
          onClose={() => {
            setShowBoletaModal(false)
            setVentaCompletada(null)
          }}
          formatearPeso={formatearPeso}
        />
      )}
    </div>
  )
}

// Componente Modal de Boleta
function BoletaModal({
  venta,
  carrito,
  usuarioVendedor,
  tipoPago,
  montoEfectivo,
  vuelto,
  onClose,
  formatearPeso,
}: any) {
  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] border border-border shadow-2xl animate-fadeIn flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0 no-print">
          <h2 className="text-2xl font-bold text-foreground">Boleta de Venta</h2>
          <div className="flex gap-2">
            <button
              onClick={handleImprimir}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 print:p-0">
          <div className="bg-white text-black p-6 rounded-lg print:shadow-none" id="boleta-print">
            {/* Encabezado */}
            <div className="text-center border-b border-gray-300 pb-4 mb-4">
              <h1 className="text-2xl font-bold mb-2">FERRETERÍA EL MAESTRO</h1>
              <p className="text-sm text-gray-600">RUT: 77.777.777-7</p>
              <p className="text-sm text-gray-600">Av. Principal 123, Santiago, Chile</p>
              <p className="text-sm text-gray-600">Tel: +56 2 2345 6789</p>
            </div>

            {/* Información de la venta */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Boleta N°:</span>
                <span>{venta.numero_factura}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Fecha:</span>
                <span>{new Date(venta.created_at).toLocaleString('es-CL', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Atendido por:</span>
                <span>{usuarioVendedor?.nombre || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">Medio de Pago:</span>
                <span className="uppercase">
                  {tipoPago === 'efectivo' ? 'Efectivo' : tipoPago === 'tarjeta' ? 'Tarjeta' : 'Factura'}
                </span>
              </div>
              {venta.empresa && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Empresa:</span>
                  <span>{(venta.empresa as any).nombre}</span>
                </div>
              )}
            </div>

            {/* Detalles de productos */}
            <div className="border-t border-gray-300 pt-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 font-semibold">Cantidad</th>
                    <th className="text-left py-2 font-semibold">Descripción</th>
                    <th className="text-right py-2 font-semibold">Precio Unit.</th>
                    <th className="text-right py-2 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item: any, index: number) => {
                    const precio = item.cantidad >= item.producto.cantidad_minima_mayor
                      ? item.producto.precio_mayor
                      : item.producto.precio_unitario
                    const subtotalItem = precio * item.cantidad
                    return (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2">{item.cantidad}</td>
                        <td className="py-2">{item.producto.nombre}</td>
                        <td className="text-right py-2">{formatearPeso(precio)}</td>
                        <td className="text-right py-2 font-semibold">{formatearPeso(subtotalItem)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="border-t border-gray-300 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatearPeso(venta.subtotal)}</span>
              </div>
              {venta.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Descuento:</span>
                  <span>-{formatearPeso(venta.descuento)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>IVA (19%):</span>
                <span>{formatearPeso(venta.impuesto)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                <span>TOTAL:</span>
                <span>{formatearPeso(venta.total)}</span>
              </div>
              {tipoPago === 'efectivo' && montoEfectivo && (
                <>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                    <span>Recibido:</span>
                    <span>{formatearPeso(parseFloat(montoEfectivo))}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Vuelto:</span>
                    <span>{formatearPeso(vuelto || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Pie de página */}
            <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t border-gray-300">
              <p>¡Gracias por su compra!</p>
              <p>Valor de compra no incluye instalación ni transporte</p>
              <p>Boleta exenta de IVA según Art. 12 letra A de la Ley de IVA</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end flex-shrink-0 bg-card no-print">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #boleta-print, #boleta-print * {
            visibility: visible;
          }
          #boleta-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
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
      <div className="bg-card rounded-xl max-w-md w-full max-h-[90vh] border border-border shadow-2xl animate-fadeIn flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
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

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
        </div>

        <div className="p-6 border-t border-border flex gap-3 flex-shrink-0 bg-card">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-accent transition-colors font-medium"
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

      {/* Modal de Cierre de Turno - Renderizado con Portal para evitar problemas de overflow */}
      {showCierreTurnoModal && user && typeof window !== 'undefined' && createPortal(
        <CierreTurnoModal
          user={user}
          onClose={() => setShowCierreTurnoModal(false)}
          onConfirmLogout={handleConfirmLogout}
        />,
        document.body
      )}
    </div>
  )
}
