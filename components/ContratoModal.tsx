'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Empleado } from '@/lib/types'
import { X, Save } from 'lucide-react'

interface ContratoModalProps {
  empleado: Empleado
  onClose: () => void
}

export default function ContratoModal({ empleado, onClose }: ContratoModalProps) {
  const [tipoContrato, setTipoContrato] = useState<'indefinido' | 'plazo_fijo' | 'honorarios' | 'temporal'>('indefinido')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [fechaTermino, setFechaTermino] = useState('')
  const [sueldoBase, setSueldoBase] = useState('')
  const [cargo, setCargo] = useState(empleado.cargo || '')
  const [jornada, setJornada] = useState<'completa' | 'parcial' | 'media'>('completa')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('contratos').insert({
        empleado_id: empleado.id,
        tipo_contrato: tipoContrato,
        fecha_inicio: fechaInicio,
        fecha_termino: fechaTermino || null,
        sueldo_base: parseFloat(sueldoBase),
        cargo: cargo,
        jornada: jornada,
        descripcion: descripcion || null,
        estado: 'activo',
      })

      if (error) throw error

      onClose()
    } catch (error) {
      console.error('Error creando contrato:', error)
      alert('Error al crear el contrato. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] border border-border shadow-2xl flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-foreground">Crear Contrato</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-accent/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Empleado</p>
            <p className="font-medium text-foreground">{empleado.nombre_completo}</p>
            <p className="text-sm text-muted-foreground">{empleado.rut}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tipo de Contrato *
            </label>
            <select
              value={tipoContrato}
              onChange={(e) => setTipoContrato(e.target.value as any)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="indefinido">Indefinido</option>
              <option value="plazo_fijo">Plazo Fijo</option>
              <option value="honorarios">Honorarios</option>
              <option value="temporal">Temporal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Término
              </label>
              <input
                type="date"
                value={fechaTermino}
                onChange={(e) => setFechaTermino(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={tipoContrato === 'indefinido'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Cargo *
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sueldo Base (CLP) *
              </label>
              <input
                type="number"
                value={sueldoBase}
                onChange={(e) => setSueldoBase(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Jornada *
              </label>
              <select
                value={jornada}
                onChange={(e) => setJornada(e.target.value as any)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="completa">Completa</option>
                <option value="parcial">Parcial</option>
                <option value="media">Media Jornada</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Descripción adicional del contrato..."
            />
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
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Crear Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
