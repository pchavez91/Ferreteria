'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/types'
import { X, Save, Plus, Trash2, DollarSign } from 'lucide-react'

interface InicioTurnoModalProps {
  user: User
  onClose: () => void
  onTurnoIniciado: () => void
}

interface DineroItem {
  tipo: 'billete' | 'moneda'
  denominacion: number
  cantidad: number
}

const DENOMINACIONES_BILLETES = [20000, 10000, 5000, 2000, 1000]
const DENOMINACIONES_MONEDAS = [500, 100, 50, 10, 5, 1]

export default function InicioTurnoModal({ user, onClose, onTurnoIniciado }: InicioTurnoModalProps) {
  const [loading, setLoading] = useState(false)
  const [dineroItems, setDineroItems] = useState<DineroItem[]>([])
  const [montoTotal, setMontoTotal] = useState(0)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (montoTotal <= 0) {
      alert('Debes agregar al menos un billete o moneda')
      return
    }

    setLoading(true)

    try {
      // Crear turno
      const { data: turno, error: turnoError } = await supabase
        .from('turnos_caja')
        .insert({
          usuario_id: user.id,
          monto_inicial: montoTotal,
          estado: 'activo',
        })
        .select()
        .single()

      if (turnoError) throw turnoError

      // Crear detalles de dinero
      if (dineroItems.length > 0) {
        const detalles = dineroItems.map(item => ({
          turno_id: turno.id,
          tipo: item.tipo,
          denominacion: item.denominacion,
          cantidad: item.cantidad,
          subtotal: item.denominacion * item.cantidad,
        }))

        const { error: detallesError } = await supabase
          .from('detalle_dinero_inicio')
          .insert(detalles)

        if (detallesError) throw detallesError
      }

      onTurnoIniciado()
    } catch (error) {
      console.error('Error iniciando turno:', error)
      alert('Error al iniciar el turno. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatearPeso = (valor: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(valor)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] border border-border shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-foreground">Iniciar Turno</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-accent/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Cajero</p>
            <p className="font-semibold text-foreground">{user.nombre}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Billetes</h3>
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

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Monedas</h3>
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
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || montoTotal <= 0}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Iniciando...' : 'Iniciar Turno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
