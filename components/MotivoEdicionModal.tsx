'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'

interface MotivoEdicionModalProps {
  onClose: () => void
  onConfirm: (motivo: string) => void
  empleadoNombre: string
}

export default function MotivoEdicionModal({ 
  onClose, 
  onConfirm,
  empleadoNombre 
}: MotivoEdicionModalProps) {
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!motivo.trim()) {
      alert('Por favor, ingresa el motivo de la edición')
      return
    }
    setLoading(true)
    onConfirm(motivo)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-card rounded-xl max-w-md w-full border border-border shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Motivo de Edición</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Estás editando los datos de <span className="font-semibold text-foreground">{empleadoNombre}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, indica el motivo de la edición:
            </p>
            <label className="block text-sm font-medium text-foreground mb-2">
              Motivo *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Ej: Actualización de dirección, cambio de cargo, corrección de datos..."
              required
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
              disabled={loading || !motivo.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Confirmar Edición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
