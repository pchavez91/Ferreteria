'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Venta } from '@/lib/types'
import { X } from 'lucide-react'

interface PagoFacturaModalProps {
  ventas: Venta[]
  onClose: () => void
}

export default function PagoFacturaModal({ ventas, onClose }: PagoFacturaModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    factura_id: '',
    empresa_id: '',
    monto: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'transferencia',
    referencia: '',
  })

  const ventaSeleccionada = ventas.find((v) => v.id === formData.factura_id)
  const empresaId = ventaSeleccionada?.empresa_id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!empresaId) {
        alert('La factura seleccionada no tiene empresa asociada')
        return
      }

      const { error } = await supabase.from('pagos_facturas').insert([
        {
          factura_id: formData.factura_id,
          empresa_id: empresaId,
          monto: parseFloat(formData.monto),
          fecha_pago: formData.fecha_pago,
          metodo_pago: formData.metodo_pago,
          referencia: formData.referencia || null,
          estado: 'pagado',
        },
      ])

      if (error) throw error

      onClose()
    } catch (error: any) {
      console.error('Error al registrar pago:', error)
      alert(error.message || 'Error al registrar pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full border border-border shadow-2xl animate-fadeIn">
        <div className="border-b border-border px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Registrar Pago de Factura</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Factura *
              </label>
              <select
                required
                value={formData.factura_id}
                onChange={(e) => setFormData({ ...formData, factura_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Seleccionar factura</option>
                {ventas.map((venta) => (
                  <option key={venta.id} value={venta.id}>
                    {venta.numero_factura} - Total: {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(Number(venta.total))}
                  </option>
                ))}
              </select>
            </div>

            {ventaSeleccionada && (
              <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                <p className="text-sm text-foreground">
                  Total de la factura: <span className="font-bold text-primary">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(Number(ventaSeleccionada.total))}
                  </span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Monto del Pago *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Fecha de Pago *
              </label>
              <input
                type="date"
                required
                value={formData.fecha_pago}
                onChange={(e) => setFormData({ ...formData, fecha_pago: e.target.value })}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Método de Pago *
              </label>
              <select
                required
                value={formData.metodo_pago}
                onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
                <option value="efectivo">Efectivo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Referencia (Opcional)
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                placeholder="Número de cheque, transferencia, etc."
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
