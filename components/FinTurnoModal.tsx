'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import { X, Save, Plus, Trash2, DollarSign, Printer, Lock } from 'lucide-react'

interface FinTurnoModalProps {
  user: User
  turnoId: string
  onClose: () => void
  onTurnoFinalizado: () => void
}

interface DineroItem {
  tipo: 'billete' | 'moneda'
  denominacion: number
  cantidad: number
}

const DENOMINACIONES_BILLETES = [20000, 10000, 5000, 2000, 1000]
const DENOMINACIONES_MONEDAS = [500, 100, 50, 10, 5, 1]

export default function FinTurnoModal({ user, turnoId, onClose, onTurnoFinalizado }: FinTurnoModalProps) {
  const [loading, setLoading] = useState(false)
  const [dineroItems, setDineroItems] = useState<DineroItem[]>([])
  const [montoTotal, setMontoTotal] = useState(0)
  const [montoTarjetasFisico, setMontoTarjetasFisico] = useState(0)
  const [ventas, setVentas] = useState<any[]>([])
  const [resumen, setResumen] = useState({
    totalEfectivo: 0,
    totalTarjeta: 0,
    totalFactura: 0,
    totalVentas: 0,
    montoInicial: 0,
  })
  const [passwordAdmin, setPasswordAdmin] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [loadingVentas, setLoadingVentas] = useState(true)

  useEffect(() => {
    loadTurnoData()
  }, [turnoId])

  const loadTurnoData = async () => {
    try {
      // Cargar datos del turno
      const { data: turno } = await supabase
        .from('turnos_caja')
        .select('*')
        .eq('id', turnoId)
        .single()

      if (turno) {
        setResumen(prev => ({
          ...prev,
          montoInicial: turno.monto_inicial || 0,
        }))
      }

      // Cargar ventas del turno
      const { data: ventasData } = await supabase
        .from('ventas')
        .select('*')
        .eq('usuario_id', user.id)
        .gte('created_at', turno?.fecha_inicio || new Date().toISOString())
        .order('created_at', { ascending: false })

      if (ventasData) {
        setVentas(ventasData)
        
        const efectivo = ventasData
          .filter(v => v.tipo_pago === 'efectivo')
          .reduce((sum, v) => sum + (Number(v.total) || 0), 0)
        
        const tarjeta = ventasData
          .filter(v => v.tipo_pago === 'tarjeta')
          .reduce((sum, v) => sum + (Number(v.total) || 0), 0)
        
        const factura = ventasData
          .filter(v => v.tipo_pago === 'factura')
          .reduce((sum, v) => sum + (Number(v.total) || 0), 0)

        setResumen(prev => ({
          ...prev,
          totalEfectivo: efectivo,
          totalTarjeta: tarjeta,
          totalFactura: factura,
          totalVentas: efectivo + tarjeta + factura,
        }))
      }
    } catch (error) {
      console.error('Error cargando datos del turno:', error)
    } finally {
      setLoadingVentas(false)
    }
  }

  useEffect(() => {
    const total = dineroItems.reduce((sum, item) => {
      return sum + (Number(item.denominacion) * Number(item.cantidad))
    }, 0)
    setMontoTotal(total)
  }, [dineroItems])

  const agregarItem = (tipo: 'billete' | 'moneda', denominacion: number) => {
    const existe = dineroItems.find(item => item.tipo === tipo && item.denominacion === denominacion)
    if (existe) {
      setDineroItems(dineroItems.map(item =>
        item.tipo === tipo && item.denominacion === denominacion
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setDineroItems([...dineroItems, { tipo, denominacion: Number(denominacion), cantidad: 1 }])
    }
  }

  const actualizarCantidad = (tipo: 'billete' | 'moneda', denominacion: number, cantidad: number) => {
    const cantidadNum = Number(cantidad) || 0
    const denominacionNum = Number(denominacion)
    
    if (cantidadNum <= 0) {
      setDineroItems(dineroItems.filter(item => !(item.tipo === tipo && Number(item.denominacion) === denominacionNum)))
    } else {
      const existe = dineroItems.find(item => item.tipo === tipo && Number(item.denominacion) === denominacionNum)
      if (existe) {
        setDineroItems(dineroItems.map(item =>
          item.tipo === tipo && Number(item.denominacion) === denominacionNum
            ? { ...item, cantidad: cantidadNum }
            : item
        ))
      } else {
        setDineroItems([...dineroItems, { tipo, denominacion: denominacionNum, cantidad: cantidadNum }])
      }
    }
  }

  const eliminarItem = (tipo: 'billete' | 'moneda', denominacion: number) => {
    setDineroItems(dineroItems.filter(item => !(item.tipo === tipo && Number(item.denominacion) === Number(denominacion))))
  }

  const handleImprimirVentas = () => {
    window.print()
  }

  const handleTerminarTurno = () => {
    if (montoTotal <= 0) {
      alert('Debes ingresar el dinero final en caja')
      return
    }
    setShowPasswordModal(true)
  }

  const verificarPasswordAdmin = async () => {
    if (!passwordAdmin) {
      alert('Debes ingresar la clave de autorización')
      return
    }

    // Clave fija para pruebas (en producción esto debería ser más seguro)
    const CLAVE_AUTORIZACION = '1234'

    if (passwordAdmin.trim() !== CLAVE_AUTORIZACION) {
      alert('Clave incorrecta')
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Verificar que hay sesión activa
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        throw new Error('No hay sesión activa')
      }

      // Buscar un usuario administrador para registrar quién aprobó
      const { data: admin } = await supabase
        .from('usuarios')
        .select('id')
        .eq('rol', 'admin')
        .limit(1)
        .single()

      const adminId = admin?.id || currentSession.user.id // Si no hay admin, usar el usuario actual

      // Finalizar el turno (manteniendo la sesión del cajero)
      await finalizarTurno(adminId)

      // Actualizar el turno con el admin que aprobó y finalizarlo
      await supabase
        .from('turnos_caja')
        .update({ 
          aprobado_por: adminId,
          estado: 'finalizado'
        })
        .eq('id', turnoId)

      // Cerrar la sesión del admin y restaurar la del cajero
      await supabase.auth.signOut()
      
      // Obtener la contraseña del cajero desde la base de datos (esto requiere que guardemos la contraseña hasheada)
      // Por ahora, simplemente redirigimos y el cajero puede volver a iniciar sesión
      // En producción, esto debería manejarse de forma más segura
      
      // Redirigir a inicio de turno (el cajero puede volver a iniciar sesión si lo desea)
      onTurnoFinalizado()
    } catch (error: any) {
      // Si hay error, intentar restaurar el estado del turno
      try {
        await supabase
          .from('turnos_caja')
          .update({ estado: 'activo', fecha_fin: null, monto_final: null })
          .eq('id', turnoId)
        
        await supabase
          .from('detalle_dinero_fin')
          .delete()
          .eq('turno_id', turnoId)
      } catch (revertError) {
        console.error('Error revirtiendo cambios:', revertError)
      }
      
      alert(error.message || 'Error al finalizar el turno')
      setLoading(false)
    }
  }

  const finalizarTurno = async (adminId: string) => {
    try {
      const diferenciaEfectivo = montoTotal - (resumen.montoInicial + resumen.totalEfectivo)
      const diferenciaTarjetas = montoTarjetasFisico - resumen.totalTarjeta
      const totalGeneral = montoTotal + montoTarjetasFisico

      // Crear detalles de dinero final PRIMERO (mientras tenemos la sesión del cajero)
      if (dineroItems.length > 0) {
        const detalles = dineroItems.map(item => ({
          turno_id: turnoId,
          tipo: item.tipo,
          denominacion: Number(item.denominacion),
          cantidad: Number(item.cantidad),
          subtotal: Number(item.denominacion) * Number(item.cantidad),
        }))

        const { error: detallesError } = await supabase
          .from('detalle_dinero_fin')
          .insert(detalles)

        if (detallesError) {
          console.error('Error insertando detalles:', detallesError)
          throw detallesError
        }
      }

      // Actualizar turno (sin cambiar el estado a finalizado todavía, solo guardar los datos)
      const { error: turnoError } = await supabase
        .from('turnos_caja')
        .update({
          fecha_fin: new Date().toISOString(),
          monto_final: totalGeneral, // Total general incluyendo tarjetas físicas
          total_ventas_efectivo: resumen.totalEfectivo,
          total_ventas_tarjeta: resumen.totalTarjeta,
          total_ventas_factura: resumen.totalFactura,
          total_ventas: resumen.totalVentas,
          diferencia: diferenciaEfectivo,
          observaciones: montoTarjetasFisico > 0 
            ? `Tarjetas físicas: ${formatearPeso(montoTarjetasFisico)} | Diferencia tarjetas: ${formatearPeso(diferenciaTarjetas)}`
            : null,
          // No cambiamos el estado todavía, lo haremos después de verificar la contraseña
        })
        .eq('id', turnoId)

      if (turnoError) {
        console.error('Error actualizando turno:', turnoError)
        throw turnoError
      }
    } catch (error) {
      console.error('Error finalizando turno:', error)
      throw error
    }
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:bg-white print:backdrop-blur-none">
        <div className="bg-card rounded-xl max-w-5xl w-full max-h-[90vh] border border-border shadow-2xl flex flex-col print:shadow-none print:border-none">
          <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0 no-print">
            <h2 className="text-2xl font-bold text-foreground">Terminar Turno</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Resumen de Ventas */}
            <div className="bg-accent/30 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Resumen de Ventas del Turno</h3>
                <button
                  type="button"
                  onClick={handleImprimirVentas}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors no-print"
                >
                  <Printer size={16} />
                  Imprimir Ventas
                </button>
              </div>
              
              {loadingVentas ? (
                <p className="text-muted-foreground">Cargando ventas...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas en Efectivo</p>
                    <p className="text-lg font-bold text-foreground">{formatearPeso(resumen.totalEfectivo)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas con Tarjeta</p>
                    <p className="text-lg font-bold text-foreground">{formatearPeso(resumen.totalTarjeta)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas Facturadas</p>
                    <p className="text-lg font-bold text-foreground">{formatearPeso(resumen.totalFactura)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ventas</p>
                    <p className="text-lg font-bold text-primary">{formatearPeso(resumen.totalVentas)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Dinero en Caja - Final */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Dinero Final en Caja</h3>
              
              <div className="mb-4">
                <h4 className="text-md font-medium text-foreground mb-3">Billetes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DENOMINACIONES_BILLETES.map(denominacion => (
                    <div key={denominacion} className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => agregarItem('billete', denominacion)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                      >
                        <Plus size={16} className="text-primary" />
                      </button>
                      <span className="flex-1 font-medium text-foreground">{formatearPeso(denominacion)}</span>
                      <input
                        type="number"
                        min="0"
                        value={dineroItems.find(item => item.tipo === 'billete' && item.denominacion === denominacion)?.cantidad || 0}
                        onChange={(e) => actualizarCantidad('billete', denominacion, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                      />
                      {dineroItems.find(item => item.tipo === 'billete' && item.denominacion === denominacion) && (
                        <button
                          type="button"
                          onClick={() => eliminarItem('billete', denominacion)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-md font-medium text-foreground mb-3">Monedas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DENOMINACIONES_MONEDAS.map(denominacion => (
                    <div key={denominacion} className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => agregarItem('moneda', denominacion)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                      >
                        <Plus size={16} className="text-primary" />
                      </button>
                      <span className="flex-1 font-medium text-foreground">{formatearPeso(denominacion)}</span>
                      <input
                        type="number"
                        min="0"
                        value={dineroItems.find(item => item.tipo === 'moneda' && item.denominacion === denominacion)?.cantidad || 0}
                        onChange={(e) => actualizarCantidad('moneda', denominacion, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                      />
                      {dineroItems.find(item => item.tipo === 'moneda' && item.denominacion === denominacion) && (
                        <button
                          type="button"
                          onClick={() => eliminarItem('moneda', denominacion)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-md font-medium text-foreground mb-3">Monto de Tarjetas Físicas</h4>
                <div className="bg-accent/30 p-4 rounded-lg border border-border">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Total en tarjetas físicas (efectivo recibido de tarjetas)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={montoTarjetasFisico}
                    onChange={(e) => setMontoTarjetasFisico(Number(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg font-semibold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Resumen de Efectivo */}
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-foreground">Total en Caja (Efectivo):</span>
                    <span className="text-2xl font-bold text-primary">{formatearPeso(montoTotal)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Monto Inicial: {formatearPeso(resumen.montoInicial)}</p>
                    <p>Ventas en Efectivo: {formatearPeso(resumen.totalEfectivo)}</p>
                    <p>Esperado en Efectivo: {formatearPeso(resumen.montoInicial + resumen.totalEfectivo)}</p>
                    <p className="font-semibold text-foreground mt-2 pt-2 border-t border-primary/20">
                      Diferencia (Efectivo): {formatearPeso(montoTotal - (resumen.montoInicial + resumen.totalEfectivo))}
                    </p>
                  </div>
                </div>

                {/* Resumen de Tarjetas */}
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-foreground">Total en Tarjetas Físicas:</span>
                    <span className="text-2xl font-bold text-blue-500">{formatearPeso(montoTarjetasFisico)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Ventas con Tarjeta: {formatearPeso(resumen.totalTarjeta)}</p>
                    <p>Tarjetas Físicas Ingresadas: {formatearPeso(montoTarjetasFisico)}</p>
                    <p className="font-semibold text-foreground mt-2 pt-2 border-t border-blue-500/20">
                      Diferencia (Tarjetas): {formatearPeso(montoTarjetasFisico - resumen.totalTarjeta)}
                    </p>
                  </div>
                </div>

                {/* Total General */}
                <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-foreground">Total General en Caja:</span>
                    <span className="text-2xl font-bold text-green-500">{formatearPeso(montoTotal + montoTarjetasFisico)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>Efectivo: {formatearPeso(montoTotal)}</p>
                    <p>Tarjetas Físicas: {formatearPeso(montoTarjetasFisico)}</p>
                    <p className="text-xs mt-1">Total de Ventas: {formatearPeso(resumen.totalVentas)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border flex justify-end gap-2 no-print">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleTerminarTurno}
              disabled={loading || montoTotal <= 0}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Lock size={16} />
              {loading ? 'Procesando...' : 'Terminar Turno'}
            </button>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white;
            }
          }
        `}</style>
      </div>

      {/* Modal de contraseña de administrador */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-card rounded-xl max-w-md w-full border border-border shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Lock size={20} />
                Verificación de Autorización
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordAdmin('')
                  setLoading(false)
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X size={20} className="text-foreground" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              verificarPasswordAdmin()
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Clave de Autorización *
                </label>
                <input
                  type="password"
                  value={passwordAdmin}
                  onChange={(e) => setPasswordAdmin(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ingresa la clave de autorización"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se requiere la clave de autorización para finalizar el turno
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordAdmin('')
                    setLoading(false)
                  }}
                  className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !passwordAdmin}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {loading ? 'Verificando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
