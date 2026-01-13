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

  const calcularTotal = () => {
    const total = dineroItems.reduce((sum, item) => {
      return sum + (item.denominacion * item.cantidad)
    }, 0)
    setMontoTotal(total)
    return total
  }

  const agregarItem = (tipo: 'billete' | 'moneda', denominacion: number) => {
    const existe = dineroItems.find(item => item.tipo === tipo && item.denominacion === denominacion)
    if (existe) {
      setDineroItems(dineroItems.map(item =>
        item.tipo === tipo && item.denominacion === denominacion
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setDineroItems([...dineroItems, { tipo, denominacion, cantidad: 1 }])
    }
    setTimeout(calcularTotal, 0)
  }

  const actualizarCantidad = (tipo: 'billete' | 'moneda', denominacion: number, cantidad: number) => {
    if (cantidad <= 0) {
      setDineroItems(dineroItems.filter(item => !(item.tipo === tipo && item.denominacion === denominacion)))
    } else {
      setDineroItems(dineroItems.map(item =>
        item.tipo === tipo && item.denominacion === denominacion
          ? { ...item, cantidad }
          : item
      ))
    }
    setTimeout(calcularTotal, 0)
  }

  const eliminarItem = (tipo: 'billete' | 'moneda', denominacion: number) => {
    setDineroItems(dineroItems.filter(item => !(item.tipo === tipo && item.denominacion === denominacion)))
    setTimeout(calcularTotal, 0)
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
      alert('Debes ingresar la contraseña del administrador')
      return
    }

    setLoading(true)

    try {
      // Guardar la sesión actual del cajero
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        throw new Error('No hay sesión activa')
      }

      // Buscar un usuario administrador
      const { data: admin } = await supabase
        .from('usuarios')
        .select('id, email')
        .eq('rol', 'admin')
        .limit(1)
        .single()

      if (!admin) {
        throw new Error('No se encontró un administrador')
      }

      // Verificar la contraseña del admin usando una función auxiliar
      // Primero finalizamos el turno con la sesión del cajero activa
      // Luego verificamos la contraseña del admin
      
      // Finalizar el turno primero (mientras tenemos la sesión del cajero)
      await finalizarTurno(admin.id)

      // Ahora verificamos la contraseña del admin
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: admin.email,
        password: passwordAdmin,
      })

      if (authError) {
        // Si la contraseña es incorrecta, revertir el turno y eliminar los detalles
        await supabase
          .from('turnos_caja')
          .update({ estado: 'activo', fecha_fin: null, monto_final: null })
          .eq('id', turnoId)
        
        // Eliminar los detalles de dinero fin que se insertaron
        await supabase
          .from('detalle_dinero_fin')
          .delete()
          .eq('turno_id', turnoId)
        
        throw new Error('Contraseña incorrecta')
      }

      // Si la contraseña es correcta, actualizar el turno con el admin que aprobó y finalizarlo
      await supabase
        .from('turnos_caja')
        .update({ 
          aprobado_por: admin.id,
          estado: 'finalizado'
        })
        .eq('id', turnoId)

      // Cerrar la sesión del admin
      await supabase.auth.signOut()
      
      // Redirigir a inicio de turno
      onTurnoFinalizado()
    } catch (error: any) {
      alert(error.message || 'Error al verificar contraseña')
      setLoading(false)
    }
  }

  const finalizarTurno = async (adminId: string) => {
    try {
      const diferencia = montoTotal - (resumen.montoInicial + resumen.totalEfectivo)

      // Crear detalles de dinero final PRIMERO (mientras tenemos la sesión del cajero)
      if (dineroItems.length > 0) {
        const detalles = dineroItems.map(item => ({
          turno_id: turnoId,
          tipo: item.tipo,
          denominacion: item.denominacion,
          cantidad: item.cantidad,
          subtotal: item.denominacion * item.cantidad,
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
          monto_final: montoTotal,
          total_ventas_efectivo: resumen.totalEfectivo,
          total_ventas_tarjeta: resumen.totalTarjeta,
          total_ventas_factura: resumen.totalFactura,
          total_ventas: resumen.totalVentas,
          diferencia: diferencia,
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

              <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">Total en Caja:</span>
                  <span className="text-2xl font-bold text-primary">{formatearPeso(montoTotal)}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Monto Inicial: {formatearPeso(resumen.montoInicial)}</p>
                  <p>Ventas en Efectivo: {formatearPeso(resumen.totalEfectivo)}</p>
                  <p>Esperado: {formatearPeso(resumen.montoInicial + resumen.totalEfectivo)}</p>
                  <p className="font-semibold text-foreground mt-1">
                    Diferencia: {formatearPeso(montoTotal - (resumen.montoInicial + resumen.totalEfectivo))}
                  </p>
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
                Verificación de Administrador
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
                  Contraseña del Administrador *
                </label>
                <input
                  type="password"
                  value={passwordAdmin}
                  onChange={(e) => setPasswordAdmin(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ingresa la contraseña del administrador"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se requiere la contraseña del administrador para finalizar el turno
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
